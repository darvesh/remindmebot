# Remindme Telegram Bot

## [@ThymiseBot](https://t.me/thymisebot)

## Usage

- Add the bot to your group

### Message syntax

`!remindme number<d|day|days|hours|hour|h|minutes|minute|m|seconds|second|s> ...`

**Note:** You must reply to a message

### Examples

```
!remindme 20d2h
!remindme 2minutes3seconds
!remindme 42h
!remindme 32minutes40s
!remindme 1000seconds

!remindme 60s1m //will remind you in 2 minutes
!remindme 20m1h //will remind you in 1hour 20 minute

```

## How to Host

1. Clone the repository & cd
2. `cp src/config.example.ts src/config.ts`
3. Fill in src/config.ts
4. `npm i && npm run build`
5. `npm start` or `pm2 start --name remindmebot npm -- start`
