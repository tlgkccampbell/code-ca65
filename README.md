# ca65 Macro Assembler Language Support (6502/65816)

This extension provides syntax highlighting and problem matchers for use with the [ca65 6502/65816 Macro Assembler](https://www.cc65.org/doc/ca65.html).

## Features

All 6502, 65816, and variant opcodes are supported by the syntax highlighter, as well as all ca65 pseudovariables, control commands, operators, and literals.

![Syntax Highlighting](images/highlighting.png)

Also provided are several problem matchers for parsing the results of compiling and linking assembly files:

* `cl65`
* `ld65`
* `ld65-config`
* `ld65-unresolved`

You can use these problem matchers in `task.json` using the normal syntax:

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

### 1.0.0

Initial release of code-ca65.