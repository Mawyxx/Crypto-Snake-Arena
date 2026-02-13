package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var L *zap.Logger

// Init creates and replaces the global logger. Call once at startup.
// In production (LOG_LEVEL=info or unset): JSON, info level.
// In development (LOG_LEVEL=debug): console, debug level, caller.
func Init() {
	level := os.Getenv("LOG_LEVEL")
	var cfg zap.Config
	if level == "debug" {
		cfg = zap.NewDevelopmentConfig()
		cfg.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	} else {
		cfg = zap.NewProductionConfig()
		switch level {
		case "warn":
			cfg.Level = zap.NewAtomicLevelAt(zapcore.WarnLevel)
		case "error":
			cfg.Level = zap.NewAtomicLevelAt(zapcore.ErrorLevel)
		default:
			cfg.Level = zap.NewAtomicLevelAt(zapcore.InfoLevel)
		}
	}

	var err error
	L, err = cfg.Build()
	if err != nil {
		panic("logger init: " + err.Error())
	}
	zap.ReplaceGlobals(L)
}
