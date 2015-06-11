SHELL=/bin/bash

all:
	./build.sh armeabi Debug
	./build.sh armeabi-v7a Debug
	#./build.sh x86 Debug
	./build.sh armeabi Release
	./build.sh armeabi-v7a Release
	#./build.sh x86 Release
nostrip:
	./build.sh armeabi Debug nostrip
	./build.sh armeabi-v7a Debug nostrip
	#./build.sh x86 Debug nostrip
	./build.sh armeabi Release nostrip
	./build.sh armeabi-v7a Release nostrip
	#./build.sh x86 Release nostrip
minimal:
	./build.sh
minimal-nostrip:
	./build.sh armeabi Debug nostrip
clean:
	rm -rf libs
	rm -rf obj
	rm -rf bin
	rm -rf gen
	rm -rf assets
