cmake_minimum_required(VERSION 3.24)
project(timeless_windows LANGUAGES C CXX)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
include(FetchContent)
include(CTest)

FetchContent_Declare(quickjs
  GIT_REPOSITORY https://github.com/quickjs-ng/quickjs.git
  GIT_TAG 6a9fe9af5ca0bf7c49ae697edef44864272317d1)
FetchContent_Declare(yoga
  GIT_REPOSITORY https://github.com/facebook/yoga.git
  GIT_TAG v3.2.1
  SOURCE_SUBDIR yoga)
set(QJS_BUILD_LIBC OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(quickjs yoga)

add_library(timeless_windows_core STATIC runtime.cpp)
target_link_libraries(timeless_windows_core PUBLIC qjs yogacore)
target_include_directories(timeless_windows_core PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
if(MSVC)
  target_compile_options(timeless_windows_core PRIVATE /W4 /utf-8)
else()
  target_compile_options(timeless_windows_core PRIVATE -Wall -Wextra -Wpedantic)
endif()

set(TIMELESS_TEST_BUNDLE "${CMAKE_CURRENT_SOURCE_DIR}/../../../apps/windows-demo/dist/app.js" CACHE FILEPATH "Built JS demo used by native integration tests")
if(BUILD_TESTING)
  add_executable(timeless_windows_test tests/runtime_test.cpp)
  target_link_libraries(timeless_windows_test PRIVATE timeless_windows_core)
  add_test(NAME windows-runtime COMMAND timeless_windows_test "${TIMELESS_TEST_BUNDLE}")
  add_executable(timeless_rich_text_test tests/rich_text_test.cpp)
  target_link_libraries(timeless_rich_text_test PRIVATE timeless_windows_core)
  add_test(NAME windows-rich-text COMMAND timeless_rich_text_test
    "${CMAKE_CURRENT_SOURCE_DIR}/../../timeless/dist/timeless.umd.min.js"
    "${CMAKE_CURRENT_SOURCE_DIR}/../../timeless-native/dist/timeless.native.umd.min.js")
endif()

if(WIN32)
  add_executable(timeless-windows WIN32 window.cpp app.manifest.rc)
  target_compile_definitions(timeless-windows PRIVATE UNICODE _UNICODE NOMINMAX WIN32_LEAN_AND_MEAN _WIN32_WINNT=0x0A00)
  target_link_libraries(timeless-windows PRIVATE timeless_windows_core d2d1 dwrite comctl32 ole32 oleaut32 oleacc uuid shell32)
  if(MINGW)
    target_link_options(timeless-windows PRIVATE -municode -static -static-libgcc -static-libstdc++)
  endif()
  if(MSVC)
    target_compile_options(timeless-windows PRIVATE /W4 /utf-8)
    target_link_options(timeless-windows PRIVATE /STACK:8388608 /MANIFEST:NO)
  endif()
  if(EXISTS "${TIMELESS_TEST_BUNDLE}")
    add_custom_command(TARGET timeless-windows POST_BUILD
      COMMAND ${CMAKE_COMMAND} -E copy_if_different "${TIMELESS_TEST_BUNDLE}" "$<TARGET_FILE_DIR:timeless-windows>/app.js"
      COMMAND ${CMAKE_COMMAND} -E copy_if_different "${quickjs_SOURCE_DIR}/LICENSE" "$<TARGET_FILE_DIR:timeless-windows>/QUICKJS-LICENSE.txt"
      COMMAND ${CMAKE_COMMAND} -E copy_if_different "${yoga_SOURCE_DIR}/LICENSE" "$<TARGET_FILE_DIR:timeless-windows>/YOGA-LICENSE.txt"
      COMMAND ${CMAKE_COMMAND} -E copy_if_different "${CMAKE_CURRENT_SOURCE_DIR}/../../../LICENSE" "$<TARGET_FILE_DIR:timeless-windows>/LICENSE.txt")
  endif()
  if(BUILD_TESTING)
    add_test(NAME windows-controls COMMAND timeless-windows --self-test "${TIMELESS_TEST_BUNDLE}")
  endif()
endif()
