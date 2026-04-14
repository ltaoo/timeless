// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "TimelessMacDemo",
    platforms: [.macOS(.v13)],
    dependencies: [
        .package(url: "https://github.com/facebook/yoga.git", from: "3.2.1"),
    ],
    targets: [
        .executableTarget(
            name: "TimelessMacDemo",
            dependencies: [
                .product(name: "yoga", package: "yoga"),
            ],
            path: "macos",
            swiftSettings: [
                .unsafeFlags(["-cxx-interoperability-mode=default"])
            ]
        ),
    ],
    cxxLanguageStandard: .cxx20
)
