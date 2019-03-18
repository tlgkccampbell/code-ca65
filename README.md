# ca65 Macro Assembler Language Support (6502/65816)

This extension provides syntax highlighting and problem matchers for use with the [ca65 6502/65816 Macro Assembler](https://www.cc65.org/doc/ca65.html).

## Features

All 6502, 65816, and variant opcodes are supported by the syntax highlighter, as well as all ca65 pseudovariables, control commands, operators, and literals.

![Syntax Highlighting](images/highlighting.png)

This extension automatically registers build tasks for 6502 and 65816 assembly files which invoke `cl65` on the file currently being edited. If you have one or more [memory map configuration
files](https://www.cc65.org/doc/ld65-5.html) in your workspace folder with the `.cfg` extension, a task will be created for each of them in addition to the default task, which does not specify a configuration file.

You can also create a file in the root of your workspace called `cl65config.json`. This allows you to optionally specify the name of the input file which is passed to the assembler as well as any additional parameters.

```json
{
    "input": "main.asm",
    "params": "--verbose"
}
```

If you want to create custom build tasks, this extension contributes the following problem matchers:

* `cl65`
* `ld65`
* `ld65-config`
* `ld65-unresolved`

You can use these problem matchers in `task.json` using the normal syntax.

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "ca65: Compile and Link Current File",
            "group": "build",
            "type": "shell",
            "command": "cl65 ${relativeFile}",
            "problemMatcher": ["$ca65", "$ld65", "$ld65-config", "$ld65-unresolved"]
        }
    ]
}
```

## Release Notes

### 1.1.0

Added autodetected build tasks.
Added support for cl65config.json.

### 1.0.0

Initial release of code-ca65.