# GQY 图片展示插件：一条命令跑完检查。
# 零依赖，不需要 npm install；只跑仓库自带的 Node 脚本。

NODE ?= node
JS_FILES := $(shell find . -type f \( -name '*.js' -o -name '*.mjs' \) -not -path './node_modules/*' -not -path './.git/*' | sort)

.PHONY: help check test clean

help:
	@echo "make check  # node --check 全部 .js/.mjs，再跑 npm test"
	@echo "make test   # 握手测试（test/handshake.mjs）"
	@echo "make clean  # 清理临时文件与日志"

check:
	@set -e; for f in $(JS_FILES); do echo "  node --check $$f"; $(NODE) --check "$$f"; done
	@$(MAKE) --no-print-directory test

test:
	@npm test

clean:
	rm -rf node_modules tmp dist
	@find . -name "*.log" -not -path "./.git/*" -delete
