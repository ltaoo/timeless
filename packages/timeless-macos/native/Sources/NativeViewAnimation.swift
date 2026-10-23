import Cocoa
import QuartzCore

/// Plays the shared stylesheet's resolved keyframes without changing Yoga geometry.
final class NativeViewAnimation: NSObject, CAAnimationDelegate {
    static let key = "timeless.css.animation"
    private struct Spec: Decodable {
        struct Frame: Decodable { let offset: Double; let style: [String: String] }
        let name: String
        let duration: String
        let delay: String
        let timing: String
        let fill: String
        let direction: String
        let frames: [Frame]
    }
    private weak var view: FlippedView?
    private var source: String?
    private var generation = 0
    private var spec: Spec?
    private(set) var running = false

    init(view: FlippedView) { self.view = view }

    func cancel() {
        generation += 1
        source = nil
        spec = nil
        running = false
        view?.layer?.removeAnimation(forKey: Self.key)
    }

    func apply(_ style: [String: String]) {
        let next = style["-timeless-animation"]
        guard next != source else { return }
        let presentation = view?.layer?.animation(forKey: Self.key) != nil ? view?.layer?.presentation() : nil
        let opacity = presentation?.opacity
        let transform = presentation?.transform
        generation += 1
        let token = generation
        source = next
        running = false
        view?.layer?.removeAnimation(forKey: Self.key)
        guard let data = next?.data(using: .utf8), let value = try? JSONDecoder().decode(Spec.self, from: data) else { spec = nil; return }
        spec = value
        // Mounting and the pending Yoga relayout finish before presentation begins.
        DispatchQueue.main.async { [weak self] in
            self?.start(value, style: style, token: token, opacity: opacity, transform: transform)
        }
    }

    private func start(_ value: Spec, style: [String: String], token: Int, opacity: Float?, transform: CATransform3D?) {
        guard token == generation, let view = view, let layer = view.layer else { return }
        let duration = max(0, Self.seconds(value.duration))
        let reversed = value.direction == "reverse" || value.direction == "alternate-reverse"
        let group = CAAnimationGroup()
        group.duration = duration
        group.beginTime = layer.convertTime(CACurrentMediaTime(), from: nil) + max(0, Self.seconds(value.delay))
        group.timeOffset = max(0, -Self.seconds(value.delay))
        group.fillMode = value.fill == "both" ? .both : value.fill == "forwards" ? .forwards : value.fill == "backwards" ? .backwards : .removed
        group.isRemovedOnCompletion = !["forwards", "both"].contains(value.fill)
        group.timingFunction = Self.timing(value.timing)
        var animations: [CAAnimation] = []
        for property in ["opacity", "transform"] {
            guard value.frames.contains(where: { $0.style[property] != nil }) else { continue }
            let base = style[property] ?? (property == "opacity" ? "1" : "none")
            var frames: [Double: String] = [0: base, 1: base]
            for frame in value.frames where frame.offset.isFinite && (0...1).contains(frame.offset) {
                if let entry = frame.style[property] { frames[reversed ? 1 - frame.offset : frame.offset] = entry }
            }
            let points = frames.keys.sorted()
            let animation = CAKeyframeAnimation(keyPath: property)
            animation.keyTimes = points.map(NSNumber.init(value:))
            if property == "opacity" {
                var values = points.map { NSNumber(value: min(1, max(0, Double(frames[$0]!) ?? 1))) }
                if let opacity = opacity { values[0] = NSNumber(value: opacity) }
                animation.values = values
            } else {
                var values = points.map { NSValue(caTransform3D: Self.transform(frames[$0]!, bounds: view.bounds, anchor: layer.anchorPoint)) }
                if let transform = transform { values[0] = NSValue(caTransform3D: transform) }
                animation.values = values
            }
            animation.duration = duration
            animations.append(animation)
        }
        group.animations = animations
        running = true
        emit("animationstart", value: value)
        guard token == generation else { return }
        if duration <= 0 || NSWorkspace.shared.accessibilityDisplayShouldReduceMotion || view.isHiddenOrHasHiddenAncestor || view.window == nil {
            if !group.isRemovedOnCompletion {
                for animation in animations.compactMap({ $0 as? CAKeyframeAnimation }) {
                    animation.values = animation.values?.last.map { [$0] }
                    animation.keyTimes = [0]
                    animation.duration = 1
                }
                group.duration = 1
                group.beginTime = 0
                group.timeOffset = 1
                group.speed = 0
                layer.add(group, forKey: Self.key)
            }
            finish(token)
            return
        }
        group.delegate = self
        group.setValue(token, forKey: "timelessGeneration")
        layer.add(group, forKey: Self.key)
    }

    func animationDidStop(_ anim: CAAnimation, finished flag: Bool) {
        guard flag, let token = anim.value(forKey: "timelessGeneration") as? Int else { return }
        finish(token)
    }

    private func finish(_ token: Int) {
        guard token == generation, running, let value = spec else { return }
        running = false
        emit("animationend", value: value)
    }

    private func emit(_ name: String, value: Spec) {
        view?.jsNode?.forProperty("_dispatchNativeEvent")?.call(withArguments: [name, ["animationName": value.name, "elapsedTime": name == "animationend" ? Self.seconds(value.duration) : 0]])
    }

    private static func seconds(_ text: String) -> Double {
        let result = Double(text.replacingOccurrences(of: "ms", with: "").replacingOccurrences(of: "s", with: "")) ?? 0
        return result.isFinite ? result / (text.hasSuffix("ms") ? 1000 : 1) : 0
    }

    private static func timing(_ text: String) -> CAMediaTimingFunction {
        if text.hasPrefix("cubic-bezier(") {
            let values = text.dropFirst(13).dropLast().split(separator: ",").compactMap { Float($0.trimmingCharacters(in: .whitespaces)) }
            if values.count == 4 && values.allSatisfy(\.isFinite) { return CAMediaTimingFunction(controlPoints: values[0], values[1], values[2], values[3]) }
        }
        return CAMediaTimingFunction(name: ["linear": .linear, "ease-in": .easeIn, "ease-out": .easeOut, "ease-in-out": .easeInEaseOut][text] ?? .default)
    }

    static func transform(_ text: String, bounds: CGRect, anchor: CGPoint) -> CATransform3D {
        let expression = try! NSRegularExpression(pattern: "([A-Za-z0-9]+)\\(([^()]*)\\)")
        let source = text as NSString
        var result = CATransform3DIdentity
        func length(_ text: String, extent: CGFloat) -> CGFloat {
            if text.hasSuffix("%") { return (Double(text.dropLast()) ?? 0) * extent / 100 }
            return NativeViewRenderer.parsePx(text)
        }
        for match in expression.matches(in: text, range: NSRange(location: 0, length: source.length)) {
            let name = source.substring(with: match.range(at: 1)).lowercased()
            let parts = source.substring(with: match.range(at: 2)).split(whereSeparator: { $0 == "," || $0.isWhitespace }).map(String.init)
            guard let first = parts.first else { continue }
            if name == "translate" || name == "translate3d" {
                result = CATransform3DTranslate(result, length(first, extent: bounds.width), parts.count > 1 ? length(parts[1], extent: bounds.height) : 0, 0)
            } else if name == "translatex" { result = CATransform3DTranslate(result, length(first, extent: bounds.width), 0, 0) }
            else if name == "translatey" { result = CATransform3DTranslate(result, 0, length(first, extent: bounds.height), 0) }
            else if name == "scale" || name == "scale3d" {
                let x = CGFloat(Double(first) ?? 1)
                result = CATransform3DScale(result, x, parts.count > 1 ? CGFloat(Double(parts[1]) ?? 1) : x, 1)
            } else if name == "scalex" { result = CATransform3DScale(result, CGFloat(Double(first) ?? 1), 1, 1) }
            else if name == "scaley" { result = CATransform3DScale(result, 1, CGFloat(Double(first) ?? 1), 1) }
            else if name == "rotate" {
                let number = Double(first.replacingOccurrences(of: "deg", with: "").replacingOccurrences(of: "rad", with: "").replacingOccurrences(of: "turn", with: "")) ?? 0
                let angle = number * (first.hasSuffix("deg") ? .pi / 180 : first.hasSuffix("turn") ? .pi * 2 : 1)
                result = CATransform3DRotate(result, angle, 0, 0, 1)
            }
        }
        let x = (0.5 - anchor.x) * bounds.width, y = (0.5 - anchor.y) * bounds.height
        result.m41 += x - result.m11 * x - result.m21 * y
        result.m42 += y - result.m12 * x - result.m22 * y
        return result
    }
}
