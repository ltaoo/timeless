// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "TimelessMacOS",
    platforms: [.macOS(.v13)],
    dependencies: [
        .package(url: "https://github.com/facebook/yoga.git", from: "3.2.1"),
    ],
    targets: [
        .executableTarget(
            name: "TimelessMacOS",
            dependencies: [
                .product(name: "yoga", package: "yoga"),
            ],
            path: "Sources",
            swiftSettings: [
                .interoperabilityMode(.Cxx)
            ]
        ),
        .testTarget(name: "TimelessMacOSTests", dependencies: ["TimelessMacOS"], path: "Tests", swiftSettings: [.interoperabilityMode(.Cxx)]),
    ],
    cxxLanguageStandard: .cxx20
)
