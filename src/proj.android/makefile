SHELL=/bin/bash

all:
	./build.sh armeabi Debug
	./build.sh armeabi-v7a Debug
	./build.sh x86 Debug
	./build.sh armeabi Release
	./build.sh armeabi-v7a Release
	./build.sh x86 Release
minimal:
	./build.sh
clean:
	rm -rf libs
	rm -rf obj
	rm -rf bin
	rm -rf gen
	rm -rf assets
