#!/usr/bin/python
# build_files.py
# Written by Samuel Oersnaes (https://github.com/samoersnaes) for RapidGame


import os
from glob import glob
from sys import exit
from re import search


"""
1. Get all the C/C++ source files in `Projects` -- source_files()
2. Remove the files that are in makeignore -- filter_sources()
3. Delete the old LOCAL_SRC_FILES in Android.mk and reassign it with the new list in -- add_to_makefile()
"""


# Should be `Projects/android`
start_path = os.getcwd()


def print_and_exit(text):
    print text
    exit(1)


def source_files():
    files = []
    os.chdir(os.path.join(start_path, '..'))

    for f in glob('*.c'):
        files.append(f)
    for f in glob('*.cpp'):
        files.append(f)
    for f in glob('*.cc'):
        files.append(f)
    for f in glob('*.cxx'):
        files.append(f)

    if len(files) == 0:
        print_and_exit('ERROR: No C/C++ source files to process. Store your files in `Projects`.')

    spaces = []
    for f in files:
        if search('\s', f):
            spaces.append(f)

    if spaces:
        print_and_exit('ERROR: C/C++ source filename(s) contain(s) spaces: ' + str(spaces))

    print 'source_files: ' + str(files)
    return files


def filter_sources(sources):
    os.chdir(start_path)
    try:
        ignore = open('makeignore', 'r')
    except IOError:
        print_and_exit('ERROR: Could not find/open makeignore in `Projects/android`.')

    for line in ignore:
        line = line.strip()
        if line and not line[0] == '#':
            try:
                sources.remove(line)
            except ValueError:
                print_and_exit('ERROR: Invalid filename in makeignore: ' + str(line))

    ignore.close()
    print 'filter_sources: ' + str(sources)
    return sources


def add_to_makefile(filtered):
    if not filtered:
        print_and_exit('ERROR: No source files to process after applying makeignore filter.')

    lines = []
    try:
        os.chdir(os.path.join(start_path, 'jni'))
    except OSError:
        print_and_exit('ERROR: Could not find/open `Projects/android/jni` directory.')

    try:
        android = open('Android.mk', 'r+')
    except IOError:
        print_and_exit('ERROR: Could not find/open Android.mk in `Projects/android/jni`.')

    found = False
    line = android.readline()
    while line:
        # if statement serves 2 purposes
        # 1: there is another line that starts with `LOCAL_SRC_FILES` that should be left alone
        # 2: `Projects/android/jni/main.cpp` must always be included in the source files list
        if line.strip().startswith('LOCAL_SRC_FILES := main.cpp'):
            found = True
            # Read through all the previous LOCAL_SRC_FILES files
            # and ignore them while the file pointer is moved forward
            while (android.readline().rstrip().endswith('\\')):
                pass
            # Add the new sources to the lines list
            lines.append('LOCAL_SRC_FILES := main.cpp')
            # index is used to access the previous file in the list in order to add a `\` at the end
            index = len(lines) - 1
            for f in filtered:
                lines[index] += ' \\'
                lines.append('                   ../../' + f)
                index += 1
        else:
            lines.append(line.rstrip())

        line = android.readline()

    if not found:
        print_and_exit('ERROR: Could not find "LOCAL_SRC_FILES := main.cpp" in `Projects/android/jni/Android.mk`.')

    # In order to make the process safer, the data has been stored in `lines`,
    # which is written to Android-new.mk before the file is renamed to Android.mk
    android.close()
    try:
        temp = open('Android-temp.mk', 'w')
    except IOError:
        print_and_exit('ERROR: Could not create temporary file in `Projects/android/jni` directory.')

    temp.write('\n'.join(lines))
    temp.close()

    try:
        os.rename('Android-temp.mk', 'Android.mk')
    except OSError:
        print_and_exit('ERROR: Could not write to `Projects/android/jni/Android.mk`.')

    print 'add_to_makefile: ' + str(android)


if __name__=='__main__':
    print 'Entering build_files.py...'
    add_to_makefile(filter_sources(source_files()))
    print 'Exiting build_files.py...'

