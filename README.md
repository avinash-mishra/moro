# moro

CLI tool for tracking work hours, with only one command. Without any arguments or stop/start buttons. No headaches. Very fast :D

## Demo
![alt tag](https://media.giphy.com/media/3oKIPvntQ5Zk3SIYow/source.gif)

## install

```bash
npm install -g moro

# or
yarn global add moro
```
It works best for 9 to 5 jobs, as there's no start/stop task feature.

## How it works?
Short version:

It's simple. When you start your work, you run moro. And when you are leaving, run moro again. And it tells you how long you have worked.

Long version:

The formula to calculate work hours is simple: time works end - time work starts - breaks = work time, e.g. 17 - 9 - 1 = 7. However, it gets tricky when you don't remember when you came to work this morning. Or yesterday...

Moro just saves the three for each day and at the end of the day tells you how much you have worked. All data is saved on your computer and doesn't leave it.

1. when you come to work you say moro:
```bash
$: moro
your start of the day is set at 9:00
...
```
2. When you are about to leave work you say moro once more, and you find out how long you have worked!
```
$ moro

Your end of the day registered as  17:15

 Today looks like this:

┌────────────────┬────────────────────────┐
│ Today          │ 7 Hours and 30 Minutes │
├────────────────┼────────────────────────┤
│ Start          │ 09:15                  │
├────────────────┼────────────────────────┤
│ End            │ 17:15                  │
├────────────────┼────────────────────────┤
│ Break duration │ 30 minutes             │
├────────────────┼────────────────────────┤
│ Date           │ 2017-03-08             │
└────────────────┴────────────────────────┘
```

moro removes half an hour for the lunch time.

That's it! You know you have worked 7 hours and 30 minutes!

### What if you forgot to say moro when you start or finish your day?
If you forget to say moro in the morning, or when you're leaving, don't worry. You can do that later on the same day, but not tomorrow for example.

To specify the start and end of your workday afterward moro has two commands: hi and bye

hi is for setting the start of the day, check the format of time HH:mm

```bash
$ moro hi 10:45
```

bye is to set the end of your work day

```bash
$ moro bye 15:56
```

You can also use break to set the total minutes of break. The default is 30 minutes. So if you just have 30 minutes break on the day, don't touch this one.

```bash
# Imagine you notice you had 45 minutes of break instead of 30, do this to set it
$ moro break 45
```

to see all your registered hours:

```bash
$ moro report --all
```
## Why not do it by a one liner?
Well I hear you. My colleague, Henri, gave me this:

```bash
echo 'You have worked:' $(echo 'scale=2;(' $(date -d 'now' +%s) - $(date -d "$(journalctl -t systemd-logind -b | grep 'Lid opened' | tail -n1 | awk '{print $1, $2, $3}')" +%s) ')' / 3600 | bc) 'hours'
```

## Setting work day duration and break time default
In Finland a full work day is 7.5 hours, which is the default in moro. To change it use this:

```
# for example to make it 6.5 hours
moro config --day 6.5
```

Also the default break time can be changed from 30 minutes

```
# to make default break 45 minutes
moro config --break 45
```

## Contributing
Yes please!

## what does moro mean?
moro means hello in Finland and in some areas especially in Tampere I've heard it a lot.
