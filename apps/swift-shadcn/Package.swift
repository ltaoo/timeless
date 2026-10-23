// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "TimelessShadcnSwift",
    platforms: [.macOS(.v14)],
    targets: [
        .executableTarget(name: "TimelessShadcnSwift", resources: [.copy("Resources/Icons")]),
        .testTarget(name: "TimelessShadcnSwiftTests", dependencies: ["TimelessShadcnSwift"]),
    ]
)
