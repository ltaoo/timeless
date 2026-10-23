import SwiftUI

struct FormPage: View {
  @ObservedObject var model: FormModel
  @Environment(\.colorScheme) private var scheme
  var body: some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    VStack(alignment: .leading, spacing: 24) {
      Text("表单组件").pageTitle()
      Text("真实 shadcn 组件：输入、选择、日期范围和文件选择，三端共享同一份页面。").muted(theme)
      field("姓名") {
        TInput(title: "姓名", text: $model.name, placeholder: "请输入姓名").accessibilityIdentifier(
          "form-name")
      }
      field("邮箱") {
        TInput(title: "邮箱", text: $model.email, placeholder: "name@example.com")
          .accessibilityIdentifier("form-email")
      }
      field("角色 / Select") {
        Button {
          model.showRoles.toggle()
        } label: {
          HStack {
            Text(model.roleLabel)
            Spacer()
            LucideIcon(name: "chevron-down")
          }
          .padding(.horizontal, 10).frame(height: 32)
        }
        .buttonStyle(GalleryButtonStyle(variant: .outline)).accessibilityIdentifier("form-role")
        .popover(isPresented: $model.showRoles, arrowEdge: .bottom) {
          ChoiceMenu(
            items: FormModel.roles.enumerated().map { index, role in
              MenuChoice(title: role.1, disabled: index == 2) {
                model.role = role.0
                model.showRoles = false
              }
            }, dismiss: { model.showRoles = false }
          )
          .frame(width: 240).environment(\.colorScheme, scheme)
        }
      }
      field("日期范围 / DateRangePicker") {
        HStack {
          TButton(
            title: model.start != nil && model.end != nil ? model.dateText : "选择日期范围",
            icon: "calendar", variant: .outline
          ) { model.showDates.toggle() }
          .accessibilityIdentifier("form-dates")
          .popover(isPresented: $model.showDates, arrowEdge: .bottom) {
            DateRangeCalendar(model: model).environment(\.colorScheme, scheme)
          }
          Spacer(minLength: 0)
        }
        Text(model.dateText).muted(theme).accessibilityIdentifier("form-date-value")
      }
      field("附件 / FilePicker") {
        TButton(title: "选择文件", icon: "file", variant: .outline, action: model.chooseFiles)
          .accessibilityIdentifier("form-files")
        Text(model.fileText).muted(theme).accessibilityIdentifier("form-file-value")
      }
      field("席位 / NumberInput") {
        HStack(spacing: 0) {
          TextField(
            "席位", value: Binding(get: { model.quantity }, set: model.setQuantity), format: .number
          )
          .textFieldStyle(.plain).padding(.horizontal, 10).accessibilityIdentifier("form-quantity")
          VStack(spacing: 0) {
            Button {
              model.setQuantity(model.quantity + 1)
            } label: {
              Image(systemName: "chevron.up").font(.system(size: 8)).frame(width: 24, height: 15)
            }
            .disabled(model.quantity >= 99).accessibilityLabel("增加席位")
            Button {
              model.setQuantity(model.quantity - 1)
            } label: {
              Image(systemName: "chevron.down").font(.system(size: 8)).frame(width: 24, height: 15)
            }
            .disabled(model.quantity <= 1).accessibilityLabel("减少席位")
          }.buttonStyle(.plain)
        }.frame(height: 32).overlay(RoundedRectangle(cornerRadius: 10).stroke(theme.input))
      }
      field("简介 / Textarea") {
        ZStack(alignment: .topLeading) {
          if model.bio.isEmpty {
            Text("简单介绍一下自己").foregroundStyle(theme.mutedForeground).padding(.horizontal, 6).padding(
              .vertical, 8
            ).allowsHitTesting(false)
          }
          TextEditor(text: $model.bio).scrollContentBackground(.hidden).padding(4).frame(height: 80)
            .accessibilityLabel("简介").accessibilityIdentifier("form-bio")
        }.overlay(RoundedRectangle(cornerRadius: 10).stroke(theme.input))
      }
      Toggle("同意示例条款", isOn: $model.agreed).toggleStyle(GalleryCheckboxStyle())
        .accessibilityIdentifier("form-agreed")
      Toggle("接收通知", isOn: $model.notifications).toggleStyle(GallerySwitchStyle())
        .accessibilityIdentifier("form-notifications")
      HStack(spacing: 12) {
        TButton(title: "提交表单", action: model.submit).accessibilityIdentifier("form-submit")
        TButton(title: "重置", variant: .secondary, action: model.reset).accessibilityIdentifier(
          "form-reset")
      }
      Text(model.result).statusBox(theme).accessibilityIdentifier("form-result")
    }.accessibilityIdentifier("form-page")
  }
  private func field<Content: View>(_ title: String, @ViewBuilder content: () -> Content)
    -> some View
  {
    VStack(alignment: .leading, spacing: 12) {
      Text(title).fontWeight(.medium)
      content()
    }.frame(maxWidth: .infinity, alignment: .leading)
  }
}

struct GalleryCheckboxStyle: ToggleStyle {
  @Environment(\.colorScheme) private var scheme
  func makeBody(configuration: Configuration) -> some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    return Button {
      configuration.isOn.toggle()
    } label: {
      HStack(spacing: 12) {
        ZStack {
          RoundedRectangle(cornerRadius: 4).fill(configuration.isOn ? theme.primary : .clear)
          RoundedRectangle(cornerRadius: 4).stroke(configuration.isOn ? theme.primary : theme.input)
          if configuration.isOn {
            LucideIcon(name: "check", size: 12).foregroundStyle(theme.primaryForeground)
          }
        }.frame(width: 16, height: 16)
        configuration.label
      }.contentShape(Rectangle())
    }.buttonStyle(.plain).accessibilityValue(configuration.isOn ? "已勾选" : "未勾选")
      .accessibilityAddTraits(configuration.isOn ? .isSelected : [])
  }
}

struct GallerySwitchStyle: ToggleStyle {
  @Environment(\.colorScheme) private var scheme
  func makeBody(configuration: Configuration) -> some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    return Button {
      configuration.isOn.toggle()
    } label: {
      HStack(spacing: 12) {
        Capsule().fill(configuration.isOn ? theme.primary : theme.input)
          .overlay(alignment: configuration.isOn ? .trailing : .leading) {
            Circle().fill(theme.background).padding(2).frame(width: 20, height: 20)
          }.frame(width: 36, height: 20)
        configuration.label
      }.contentShape(Rectangle())
    }.buttonStyle(.plain).accessibilityValue(configuration.isOn ? "开启" : "关闭")
  }
}

struct DateRangeCalendar: View {
  @ObservedObject var model: FormModel
  @Environment(\.colorScheme) private var scheme
  var body: some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    HStack(alignment: .top, spacing: 16) {
      month(offset: model.leftMonthOffset, left: true, theme: theme)
      month(offset: model.rightMonthOffset, left: false, theme: theme)
    }.padding(12).background(theme.card).onExitCommand { model.showDates = false }
  }
  private func month(offset: Int, left: Bool, theme: GalleryTheme) -> some View {
    let date = model.monthDate(offset: offset)
    let calendar = Calendar.current
    return VStack(spacing: 8) {
      HStack {
        TButton(title: "上个月", icon: "chevron-left", variant: .ghost, iconOnly: true, size: 28) {
          model.moveMonth(left: left, delta: -1)
        }
        .disabled(!left && model.rightMonthOffset - 1 <= model.leftMonthOffset)
        Spacer(minLength: 0)
        Text(
          "\(calendar.component(.year, from: date).formatted(.number.grouping(.never)))年\(calendar.component(.month, from: date))月"
        ).fontWeight(.medium)
        Spacer(minLength: 0)
        TButton(title: "下个月", icon: "chevron-right", variant: .ghost, iconOnly: true, size: 28) {
          model.moveMonth(left: left, delta: 1)
        }
        .disabled(left && model.leftMonthOffset + 1 >= model.rightMonthOffset)
      }
      LazyVGrid(columns: Array(repeating: GridItem(.fixed(32), spacing: 0), count: 7), spacing: 0) {
        ForEach(["一", "二", "三", "四", "五", "六", "日"], id: \.self) {
          Text($0).font(.system(size: 12)).foregroundStyle(theme.mutedForeground).frame(
            width: 32, height: 32)
        }
        ForEach(model.days(in: date), id: \.self) { day in
          let selected = day == model.start || day == model.end
          let inRange =
            model.start.map { start in model.end.map { day >= start && day <= $0 } ?? false }
            ?? false
          Button {
            model.selectDate(day)
          } label: {
            Text("\(calendar.component(.day, from: day))").frame(width: 32, height: 32)
              .foregroundStyle(
                selected
                  ? theme.primaryForeground
                  : calendar.isDate(day, equalTo: date, toGranularity: .month)
                    ? theme.foreground : theme.mutedForeground.opacity(0.5)
              )
              .background(
                selected ? theme.primary : inRange ? theme.muted : .clear,
                in: RoundedRectangle(cornerRadius: 6))
          }.buttonStyle(.plain).accessibilityLabel(FormModel.format(day)).accessibilityAddTraits(
            selected ? .isSelected : [])
        }
      }
    }.frame(width: 224)
  }
}
