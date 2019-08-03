export var messages = {
    'en': {
        app: {
            about: 'About',
            settings: "Settings"
        },
        about: {
            acknoledgements: 'Acknoledgements of Packages',
            versionShort: 'v'
        },
        error: {
            title: 'Error',
            notes: 'This page is not found.'
        },
        androidTips: {
            need: "Need Permissions",
            backgroundRunning: {
                title: 'Please allow wnr to run in background.',
                notes: 'It\'s for better timer accurancy. We won\'t abuse your permission. ',
                tip: 'Click "Now Go" and wnr will redirect you to the settings. If not, read the notes below.',
                osSpecifiedTips: {
                    huawei: 'Take Huawei EMUI9.1 / Honor MagicUI2.1 for example, you can go to the Settings, and then go to Apps->App launch, and find wnr in the list; then uncheck the checkbox alongside with wnr, check "Run in background" in the window pops up.'
                }
            },
            lockNotification: {
                title: 'Please allow wnr to send notification when locked.',
                notes: 'It\'s for better experience. We won\'t abuse your permission. ',
                tip: 'Click "Now Go" and wnr will redirect you to the settings. If not, read the notes below.',
                osSpecifiedTips: {
                    huawei: 'Take Huawei EMUI9.1 / Honor MagicUI2.1 for example, you can go to the Settings, and then go to Apps->Apps, and find wnr in the list; then go to "Notifications" and click "Lock screen notifications" and check "show" in the window pops up.'
                }
            },
            finished: 'If you\'ve finished, click this to use wnr.',
            nowDo: "Now Go"
        },
        home: {
            onlyRest: "Only rest",
            awayFromDevice: {
                1: 'Away from',
                2: 'Device'
            },
            starterTip: 'Start!',
            placeholder: {
                title: 'Title (optional)',
                workTime: 'Work Time (minute)',
                restTime: 'Rest Time (minute)',
                loop: 'Loops',
                notes: 'Notes (optional)'
            },
            allSum: {
                1: "all together",
                2: "minutes, to"
            },
            illegalInput: "Illegal Input. ",
            illegalReason: {
                badContent: "Please insert positive numbers in the form. ",
                tooBig: "The total time is too long, or there're too many loops. "
            }
        },
        timer: {
            h: "h ",
            min: "min ",
            s: "s ",
            ended: "End",
            working: "WORKING",
            resting: "RESTING",
            backer: "Let's Back Home",
            allTime: {
                title: "Time Used: "
            },
            workTimeEnd: {
                title: "Work Time End",
                body: "You can now rest. "
            },
            restTimeEnd: {
                title: "Rest Time End",
                body: "You should now back to work. "
            },
            allTimeEnd: {
                title: "Schedule End",
                body: "You can have another schedule. "
            },
            oneMinTip: {
                title: "Only One Minute Left",
                body: "You can prepare to stop the thing you are doing now."
            }
        },
        settings: {
            submit: "Save all & Back",
            defaultWorkTime: "Default work time: ",
            defaultWorkTimeMessage: "Set the default work time. <i>(Only positive integer, time less than a day.)</i>",
            defaultRestTime: "Default rest time: ",
            defaultRestTimeMessage: "Set the default rest time. <i>(Only positive integer, time less than a day.)</i>",
            defaultLoop: "Default loops: ",
            defaultLoopMessage: "Set how many rounds do you want. <i>(Only positive integer, less than 20.)</i>",
            oneMinTip: "1 Min Left Tip: ",
            oneMinTipMessage: "Set if you want to have a tip when a period of time is only 1 minute left. <i>(Only true/false are OK.)</i> "
        }
    },
    'zh-CN': {
        app: {
            about: '关于',
            settings: "设置"
        },
        about: {
            acknoledgements: '致谢：使用的类库名单',
            versionShort: '版本'
        },
        error: {
            title: '出错了',
            notes: 'wnr找不到这个页面了……返回首页吧。'
        },
        androidTips: {
            need: "需要权限",
            backgroundRunning: {
                title: '请允许wnr在后台运行',
                notes: '这是为了wnr能够准确地运行计时器。我们保证不会滥用后台运行权限。',
                tip: '点击“现在就去完成”，wnr会将您带到设置界面。如果没有，请看以下提示。',
                osSpecifiedTips: {
                    huawei: '以华为EMUI9.1/荣耀MagicUI2.1为例：请打开设置，并进入应用->应用启动管理，关闭“全部自动管理”，并找到“wnr”，取消选中“自动管理”，并勾选“允许后台活动”。'
                }
            },
            lockNotification: {
                title: '请允许wnr发送锁屏通知',
                notes: '这是为了wnr能够在您锁屏时仍然发出“时间到”的通知。我们保证不会滥用锁屏通知权限。',
                tip: '点击“现在就去完成”，wnr会将您带到设置界面。如果没有，请看以下提示。',
                osSpecifiedTips: {
                    huawei: '以华为EMUI9.1/荣耀MagicUI2.1为例：请打开设置，并进入应用->应用管理，在列表中找到wnr并点击，并进入“通知管理”选项卡，在“锁屏通知”选项卡中选择“显示”。'
                }
            },
            finished: '我确认我已经完成',
            nowDo: '现在就去完成'
        },
        home: {
            onlyRest: "仅休息",
            awayFromDevice: {
                1: '专心模式',
                2: '不用设备'
            },
            starterTip: '开始',
            placeholder: {
                title: '请输入任务名称（选填）',
                workTime: '请输入工作时间（分钟）',
                restTime: '请输入休息时间（分钟）',
                loop: '请输入时间循环次数',
                notes: '还有什么想要记的吗（选填）'
            },
            allSum: {
                1: "共计",
                2: "分钟，到"
            },
            illegalInput: "wnr觉得有些项的内容不是很合理呢…",
            illegalReason: {
                badContent: "请在全部的必填项中输入一个正整数。",
                tooBig: "总时间太长了，长于一天，或是循环次数太多。"
            }
        },
        timer: {
            h: "时 ",
            min: "分 ",
            s: "秒 ",
            ended: "!!完成了!!",
            working: "工作",
            resting: "休息",
            backer: "点左上角返回首页，开启下一段时间",
            allTime: {
                title: "总时间："
            },
            workTimeEnd: {
                title: "工作时间结束！",
                body: "你可以休息了。"
            },
            restTimeEnd: {
                title: "休息时间结束！",
                body: "你应当工作了。"
            },
            allTimeEnd: {
                title: "计划结束了！",
                body: "你可以用wnr开启下一段时间了！"
            },
            oneMinTip: {
                title: "这一段时间还剩下一分钟。",
                body: "如果手上的事情还未完成，可以准备暂时休整了。"
            }
        },
        settings: {
            submit: "保存并返回",
            defaultWorkTime: "默认工作时间：",
            defaultWorkTimeMessage: "设置默认工作时间。<i>（只能输入正整数，且时长应小于一天。）</i>",
            defaultRestTime: "默认休息时间：",
            defaultRestTimeMessage: "设置默认休息时间。<i>（只能输入正整数，且时长应小于一天。）</i>",
            defaultLoop: "默认循环次数：",
            defaultLoopMessage: "设置默认循环次数。<i>（只能输入正整数，且小于20。）</i>",
            oneMinTip: "是否在剩余1分钟时提示：",
            oneMinTipMessage: "设置是否在剩余1分钟时提示准备休整。<i>（只能输入true/false，或者留空。）</i>"
        }
    }
}