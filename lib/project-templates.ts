import { ProjectTemplate } from '@/types/ide';
import { createFileNode } from './file-utils';
import { TypeScriptIcon, PythonIcon, JavaIcon, CppIcon, CIcon } from '@/components/icons/language-icons';
import React from 'react';

export const getProjectTemplates = (): ProjectTemplate[] => [
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'A basic TypeScript project',
    icon: React.createElement(TypeScriptIcon, { className: 'w-6 h-6' }),
    files: [
      createFileNode('package.json', 'file', '', JSON.stringify({
        name: 'typescript-project',
        version: '0.1.0',
        scripts: {
          build: 'tsc',
          start: 'node dist/index.js',
          dev: 'ts-node src/index.ts'
        },
        dependencies: {},
        devDependencies: {
          typescript: '^5.0.2',
          'ts-node': '^10.9.1',
          '@types/node': '^20.6.2'
        }
      }, null, 2)),
      createFileNode('tsconfig.json', 'file', '', JSON.stringify({
        compilerOptions: {
          target: 'es2016',
          module: 'commonjs',
          outDir: './dist',
          rootDir: './src',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        },
        include: ['src/**/*'],
        exclude: ['node_modules']
      }, null, 2)),
      {
        ...createFileNode('src', 'folder'),
        children: [
          createFileNode('index.ts', 'file', 'src', `console.log('Hello, TypeScript!');`)
        ]
      }
    ]
  },
  {
    id: 'python',
    name: 'Python',
    description: 'A basic Python project',
    icon: React.createElement(PythonIcon, { className: 'w-6 h-6' }),
    files: [
      createFileNode('requirements.txt', 'file', '', ''),
      createFileNode('main.py', 'file', '', `def main():
    print("Hello, Python!")

if __name__ == "__main__":
    main()`),
      createFileNode('README.md', 'file', '', `# Python Project

A simple Python project.

## Setup
\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Run
\`\`\`bash
python main.py
\`\`\``)
    ]
  },
  {
    id: 'java',
    name: 'Java',
    description: 'A basic Java project',
    icon: React.createElement(JavaIcon, { className: 'w-6 h-6' }),
    files: [
      createFileNode('pom.xml', 'file', '', `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>java-project</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>
</project>`),
      {
        ...createFileNode('src/main/java/com/example', 'folder'),
        children: [
          createFileNode('Main.java', 'file', 'src/main/java/com/example', `package com.example;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`)
        ]
      }
    ]
  },
  {
    id: 'cpp',
    name: 'C++',
    description: 'A basic C++ project',
    icon: React.createElement(CppIcon, { className: 'w-6 h-6' }),
    files: [
      createFileNode('CMakeLists.txt', 'file', '', `cmake_minimum_required(VERSION 3.10)
project(cpp_project)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(cpp_project src/main.cpp)`),
      {
        ...createFileNode('src', 'folder'),
        children: [
          createFileNode('main.cpp', 'file', 'src', `#include <iostream>

int main() {
    std::cout << "Hello, C++!" << std::endl;
    return 0;
}`)
        ]
      }
    ]
  },
  {
    id: 'c',
    name: 'C',
    description: 'A basic C project',
    icon: React.createElement(CIcon, { className: 'w-6 h-6' }),
    files: [
      createFileNode('Makefile', 'file', '', `CC=gcc
CFLAGS=-I.

c_project: src/main.c
	$(CC) -o c_project src/main.c $(CFLAGS)`),
      {
        ...createFileNode('src', 'folder'),
        children: [
          createFileNode('main.c', 'file', 'src', `#include <stdio.h>

int main() {
    printf("Hello, C!\\n");
    return 0;
}`)
        ]
      }
    ]
  }
];