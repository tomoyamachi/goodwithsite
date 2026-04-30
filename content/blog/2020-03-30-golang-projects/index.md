---
title: "Accelerate your projects in Golang"
slug: golang-projects
date: 2020-03-30
authors:
  - Tomoya Amachi
published: false
description: ""
---
# Create directories

[https://github.com/golang-standards/project-layout](https://github.com/golang-standards/project-layout)

# Create Dockerfile it can build code automatically

# Create a logger

You should stop logging with `fmt.Print`.

I always create `logger` package it almost same as the golang's builtin log package.

log package can set output to io.Writer. fmt.Print can output to only os.Stdout.

```bash
f, err := os.OpenFile("/var/golangapp.log", os.O_RDWR | os.O_CREATE | os.O_APPEND, 0666)
if err != nil {
    log.Fatalf("error opening file: %v", err)
}
defer f.Close()
log.SetOutput(f) // log outputs to /var/golangapp.log
```

```bash
package logger

import "log"

type logLevel int

// LogLevel map
const (
	DebugLevel logLevel = iota + 1
	InfoLevel
	ErrorLevel
)

type stackTrace []string
// runtime.Callers => fetchStacktrace => logger.Errorf
const defaultSkipCaller = 3
// stacktrace時に、10ステップ前まで遡る
const traceCaller = 10

var levels = map[string]logLevel{
	"debug": DebugLevel,
	"info":  InfoLevel,
	"error": ErrorLevel,
}

// Logger is log client
type Logger struct {
	level  logLevel
	caller bool
}

// New returns new Logger pointer
func New() *Logger {
	levelStr := env.LocalEnv("LOG_LEVEL")

	level, ok := levels[levelStr]
	if !ok {
		log.Printf("log level must debug/info/error, you given %q\n", levelStr)
		level = InfoLevel
	}
	return &Logger{
		level:  level,
		caller: env.LocalEnv("LOG_CALLER") != "",
	}
}

func (l *Logger) enablePut(level logLevel) bool {
	return l.level <= level
}

// Debug is
func (l *Logger) Debug(msg ...interface{}) {
	if l.enablePut(DebugLevel) {
		log.Print(msg...)
	}
}

// Debugf is
func (l *Logger) Debugf(format string, msg ...interface{}) {
	if l.enablePut(DebugLevel) {
		log.Printf(format, msg...)
	}
}

// Info is
func (l *Logger) Info(msg ...interface{}) {
	if l.enablePut(InfoLevel) {
		log.Println(msg...)
	}
}

// Infof is
func (l *Logger) Infof(format string, msg ...interface{}) {
	if l.enablePut(InfoLevel) {
		log.Printf(format, msg...)
	}
}

// Error is
func (l *Logger) Error(msg ...interface{}) {
	if l.enablePut(ErrorLevel) {
		log.Println(msg...)
		if l.caller {
			st := fetchStackTraceFrame(defaultSkipCaller)
			for _, trace := range st {
				log.Println(trace)
			}
		}
	}
}

// Errorf is
func (l *Logger) Errorf(format string, msg ...interface{}) {
	if l.enablePut(ErrorLevel) {
		log.Printf(format, msg...)
		if l.caller {
			st := fetchStackTraceFrame(defaultSkipCaller)
			for _, trace := range st {
				log.Println(trace)
			}
		}
	}
}

func fetchStackTraceFrame(skipCaller int) []string {
	pc := make([]uintptr, traceCaller)
	n := runtime.Callers(skipCaller, pc)
	if n == 0 {
		return stackTrace{}
	}
	// ready for skip last call function
	lastCaller := 0
	for _, p := range pc {
		if p == 0x0 {
			continue
		}
		lastCaller++
	}
	// delete last call function : runtime.exit
	if lastCaller <= traceCaller {
		pc = pc[:(lastCaller - 1)]
	}
	st := make([]string, 0, lastCaller)
	// frame単位で保存する
	frames := runtime.CallersFrames(pc)
	for {
		frame, more := frames.Next()
		st = append(st, fmt.Sprintf("%s=>%s:%d", frame.Function, frame.File, frame.Line))
		if !more {
			break
		}
	}
	return st
}
```
