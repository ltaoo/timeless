import Cocoa

enum NativeImageLoader {
    static let cache: NSCache<NSString, NSImage> = {
        let cache = NSCache<NSString, NSImage>()
        cache.countLimit = 128
        return cache
    }()

    /// Both ordinary Image views and rich text use the same decoded images.
    static func load(_ source: String, completion: @escaping (NSImage?) -> Void) {
        if let image = cache.object(forKey: source as NSString) { completion(image); return }
        let parsed = URL(string: source.hasPrefix("//") ? "https:" + source : source)
        let url = parsed?.scheme == nil
            ? URL(fileURLWithPath: source.removingPercentEncoding ?? source, relativeTo: Bundle.main.resourceURL)
            : parsed
        guard let url = url, ["https", "http", "file"].contains(url.scheme?.lowercased() ?? "") else {
            completion(nil)
            return
        }
        let finish: (Data?) -> Void = { data in
            DispatchQueue.main.async {
                let image = data.flatMap(NSImage.init(data:))
                if let image = image { cache.setObject(image, forKey: source as NSString) }
                completion(image)
            }
        }
        if url.isFileURL {
            DispatchQueue.global().async { finish(try? Data(contentsOf: url)) }
        } else {
            URLSession.shared.dataTask(with: url) { data, response, error in
                guard error == nil, let response = response as? HTTPURLResponse,
                      (200..<300).contains(response.statusCode) else { finish(nil); return }
                finish(data)
            }.resume()
        }
    }
}
