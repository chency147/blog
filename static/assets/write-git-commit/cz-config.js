module.exports = {
    // type 类型
    types: [
        { value: 'feat', name: 'feat:     一项新特性' },
        { value: 'fix', name: 'fix:      修复一个BUG' },
        { value: 'docs', name: 'docs:     仅修改文档说明' },
        {
            value: 'style',
            name:
                'style:    不影响代码含义的改动\n            (空格增删、代码格式化等)',
        },
        {
            value: 'refactor',
            name: 'refactor: 重构，既不是新特性也不是BUG修复',
        },
        {
            value: 'perf',
            name: 'perf:     性能优化',
        },
        { value: 'test', name: 'test:     测试用例修改' },
        {
            value: 'chore',
            name:
                'chore:    对构建过程或辅助工具和库的更改\n            比如文档生成工具，CI流程工具等',
        },
        { value: 'revert', name: 'revert:   回退一个提交' },
        { value: 'WIP', name: 'WIP:      功能、改动尚在进行，未满足提交条件' },
    ],

    // score 类型，一般按照业务的模块进行划分
    scopes: [
        ['login', '登录相关'],
        ['payment', '支付相关'],
        ['order', '订单相关'],
        ['other', '其他修改'],
        // 如果选择 custom ,后面会让你再输入一个自定义的 scope , 也可以不设置此项， 把后面的 allowCustomScopes 设置为 true
        ['custom', '以上都不是？我要自定义'],
      ].map(([value, description]) => {
        return {
          value,
          name: `${value.padEnd(30)} (${description})`
        };
      }),

    // allowTicketNumber: false,
    // isTicketNumberRequired: false,
    // ticketNumberPrefix: 'TICKET-',
    // ticketNumberRegExp: '\\d{1,5}',

    // 可以设置 scope 的类型跟 type 的类型匹配项，例如: 'fix'
    /*
    scopeOverrides: {
      fix: [
  
        {name: 'merge'},
        {name: 'style'},
        {name: 'e2eTest'},
        {name: 'unitTest'}
      ]
    },
    */
    // 覆写提示的信息
    messages: {
        type: "选择你要提交的类型：",
        scope: '\n选择一个 scope (可选)：',
        // 选择 scope: custom 时会出下面的提示
        customScope: '请输入自定义的 scope：',
        subject: '填写一个简短精炼语句描述本次修改：\n',
        body: '请填写更为详细的描述（可选）. 使用"|"进行换行:\n',
        breaking: '列出非兼容性的变更 (可选)：\n',
        footer: '请填写本次任务关联的JIRA任务号（可选）举例：SJCGBS-12345 ：\n',
        confirmCommit: '确认提交？',
    },
    // 是否允许自定义填写 scope ，设置为 true ，会自动添加两个 scope 类型 [{ name: 'empty', value: false },{ name: 'custom', value: 'custom' }]
    allowCustomScopes: true,
    allowBreakingChanges: ['feat', 'fix'],
    // skip any questions you want
    // skipQuestions: ['body'],

    // subject 限制长度
    subjectLimit: 100,
    // breaklineChar: '|', // 支持 body 和 footer
    // footer前缀
    footerPrefix : '@jira: '
    // askForBreakingChangeFirst : true, // default is false
};
