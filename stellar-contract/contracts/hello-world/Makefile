# BELT-2 Stellar Contract Makefile
default: build

all: test

test: build
	cargo test

build:
	stellar contract build
	@echo "BELT-2 contract built successfully"
	@ls -l target/wasm32v1-none/release/*.wasm

fmt:
	cargo fmt --all

clean:
	cargo clean
	@echo "BELT-2 contract cleaned"
