#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tinycc_full.py — 迷你编译器【完整版】
配套《GCC 编译原理》教学网站第 16 章。

支持的语法（比教学版 tinycc.py 多出：变量、比较、if/else、while、块、print）：
    变量赋值:   x = 1 + 2 * 3;
    比较:       x < 10,  y == 5,  a >= b
    分支:       if (条件) 语句 [else 语句]
    循环:       while (条件) 语句
    复合语句:   { 语句; 语句; ... }
    输出:       print 表达式;

用法:
    python3 tinycc_full.py 程序.txt > out.s
    gcc -no-pie out.s -o demo && ./demo

示例程序（保存为 demo.txt）:
    i = 0;
    sum = 0;
    while (i <= 100) {
        sum = sum + i;
        i = i + 1;
    }
    print sum;          # 输出 5050

作者思路对应教学网站：
    词法(第4章) -> 语法/AST(第5章) -> 代码生成(第9章, 栈式求值)
"""

import sys

# ============ 1. 词法分析（对应第 4 章） ============
def tokenize(src):
    toks, i = [], 0
    while i < len(src):
        c = src[i]
        if c.isspace():
            i += 1; continue
        if c.isdigit():
            j = i
            while j < len(src) and src[j].isdigit():
                j += 1
            toks.append(('NUM', int(src[i:j]))); i = j; continue
        if c.isalpha() or c == '_':
            j = i
            while j < len(src) and (src[j].isalnum() or src[j] == '_'):
                j += 1
            toks.append(('ID', src[i:j])); i = j; continue
        if src[i:i+2] in ('==', '!=', '<=', '>='):
            toks.append((src[i:i+2], src[i:i+2])); i += 2; continue
        if c in '+ - * / ( ) { } ; < > ='.split():
            toks.append((c, c)); i += 1; continue
        raise SyntaxError("非法字符: %r" % c)
    toks.append(('EOF', None))
    return toks

# ============ 2. 抽象语法树（对应第 5 章） ============
class Num:   def __init__(s, v):   s.v = v
class Var:   def __init__(s, n):   s.n = n
class Bin:   def __init__(s, o, l, r): s.o, s.l, s.r = o, l, r
class Asg:   def __init__(s, n, e): s.n, s.e = n, e
class If:    def __init__(s, c, t, e): s.c, s.t, s.e = c, t, e
class Wh:    def __init__(s, c, b): s.c, s.b = c, b
class Block: def __init__(s, stmts): s.stmts = stmts
class Print: def __init__(s, e):  s.e = e

# ============ 3. 递归下降解析器（对应第 5 章） ============
class Parser:
    def __init__(self, toks):
        self.t = toks; self.p = 0
    def peek(self):  return self.t[self.p]
    def next(self):  x = self.t[self.p]; self.p += 1; return x
    def expect(self, op):
        t = self.next()
        if t[0] != op:
            raise SyntaxError("期望 '%s'，实际 %s" % (op, t[0]))

    def parse(self):
        stmts = []
        while self.peek()[0] != 'EOF':
            stmts.append(self.statement())
        return Block(stmts)

    def statement(self):
        t = self.peek()[0]
        if t == '{':
            self.next(); stmts = []
            while self.peek()[0] != '}':
                stmts.append(self.statement())
            self.expect('}')
            return Block(stmts)
        if t == 'if':
            self.next(); self.expect('(')
            cond = self.expr(); self.expect(')')
            then = self.statement(); els = None
            if self.peek()[0] == 'else':
                self.next(); els = self.statement()
            return If(cond, then, els)
        if t == 'while':
            self.next(); self.expect('(')
            cond = self.expr(); self.expect(')')
            return Wh(cond, self.statement())
        if t == 'print':
            self.next()
            e = self.expr(); self.expect(';')
            return Print(e)
        if t == 'ID' and self.t[self.p + 1][0] == '=':
            name = self.next()[1]; self.next()      # 吃掉 '='
            e = self.expr(); self.expect(';')
            return Asg(name, e)
        raise SyntaxError("意外的语句开头: %s" % t)

    # 优先级：comparison > additive > multiplicative
    def expr(self):
        node = self.cmp()
        while self.peek()[0] in ('==', '!=', '<', '>', '<=', '>='):
            op = self.next()[0]; node = Bin(op, node, self.cmp())
        return node
    def cmp(self):  return self.arith()            # 命名对齐教学版术语
    def arith(self):
        node = self.term()
        while self.peek()[0] in ('+', '-'):
            op = self.next()[0]; node = Bin(op, node, self.term())
        return node
    def term(self):
        node = self.factor()
        while self.peek()[0] in ('*', '/'):
            op = self.next()[0]; node = Bin(op, node, self.factor())
        return node
    def factor(self):
        t = self.next()
        if t[0] == 'NUM': return Num(t[1])
        if t[0] == 'ID':  return Var(t[1])
        if t[0] == '(':
            e = self.expr(); self.expect(')'); return e
        raise SyntaxError("意外的 token: %s" % t[0])

# ============ 4. 代码生成（对应第 9 章，栈式求值） ============
class Gen:
    def __init__(self):
        self.lines = []; self.slots = {}; self.off = 0; self.lbl = 0
    def emit(self, *a):  self.lines.append('  ' + ' '.join(a))
    def label(self):
        self.lbl += 1; return ".L%d" % self.lbl
    def alloc(self, name):     # 变量 -> 栈帧偏移
        self.off += 8; self.slots[name] = self.off

    def gen_expr(self, node):  # 结果压栈
        if isinstance(node, Num):
            self.emit('movl', '$%d' % node.v, '%eax')
            self.emit('pushq', '%rax'); return
        if isinstance(node, Var):
            off = self.slots[node.n]
            self.emit('movl', '-%d(%%rbp)' % off, '%eax')
            self.emit('pushq', '%rax'); return
        if isinstance(node, Bin):
            if node.o in ('==', '!=', '<', '>', '<=', '>='):
                self.gen_expr(node.l); self.gen_expr(node.r)
                self.emit('popq', '%rcx'); self.emit('popq', '%rax')
                self.emit('cmpl', '%ecx', '%eax')   # 比较 eax 与 ecx
                L1, L2 = self.label(), self.label()
                jcc = {'==': 'je', '!=': 'jne', '<': 'jl',
                       '>': 'jg', '<=': 'jle', '>=': 'jge'}[node.o]
                self.emit(jcc, L1)
                self.emit('movl', '$0', '%eax'); self.emit('jmp', L2)
                self.emit('%s:' % L1); self.emit('movl', '$1', '%eax')
                self.emit('%s:' % L2); self.emit('pushq', '%rax'); return
            self.gen_expr(node.l); self.gen_expr(node.r)
            self.emit('popq', '%rcx'); self.emit('popq', '%rax')
            if   node.o == '+': self.emit('addl',  '%ecx', '%eax')
            elif node.o == '-': self.emit('subl',  '%ecx', '%eax')
            elif node.o == '*': self.emit('imull', '%ecx', '%eax')
            elif node.o == '/':
                self.emit('cltd'); self.emit('idivl', '%ecx')
            self.emit('pushq', '%rax'); return
        raise SyntaxError("bad expr")

    def gen_stmt(self, node):
        if isinstance(node, Block):
            for s in node.stmts: self.gen_stmt(s)
            return
        if isinstance(node, Asg):
            if node.n not in self.slots: self.alloc(node.n)
            self.gen_expr(node.e)
            self.emit('popq', '%rax')
            self.emit('movl', '%eax', '-%d(%%rbp)' % self.slots[node.n])
            return
        if isinstance(node, Print):
            self.gen_expr(node.e)
            self.emit('popq', '%rsi')          # printf 第 2 参数
            self.emit('leaq', '.Lfmt', '%rdi') # printf 第 1 参数
            self.emit('call', 'printf')
            return
        if isinstance(node, If):
            L_then, L_end = self.label(), self.label()
            self.gen_expr(node.c)
            self.emit('popq', '%rax'); self.emit('testl', '%eax', '%eax')
            self.emit('jne', L_then)
            if node.e: self.gen_stmt(node.e)
            self.emit('jmp', L_end)
            self.emit('%s:' % L_then); self.gen_stmt(node.t)
            self.emit('%s:' % L_end)
            return
        if isinstance(node, Wh):
            L_cond, L_body, L_end = self.label(), self.label(), self.label()
            self.emit('%s:' % L_cond)
            self.gen_expr(node.c)
            self.emit('popq', '%rax'); self.emit('testl', '%eax', '%eax')
            self.emit('jne', L_body); self.emit('jmp', L_end)
            self.emit('%s:' % L_body); self.gen_stmt(node.b)
            self.emit('jmp', L_cond)
            self.emit('%s:' % L_end)
            return

# ============ 5. 组装与入口 ============
def compile_prog(src):
    ast = Parser(tokenize(src)).parse()
    g = Gen()
    g.gen_stmt(ast)
    return g.lines

def main():
    if len(sys.argv) > 1:
        src = open(sys.argv[1], encoding='utf-8').read()
    else:
        src = ("i = 0;\nsum = 0;\n"
               "while (i <= 100) { sum = sum + i; i = i + 1; }\n"
               "print sum;\n")
    body = compile_prog(src)
    print('.text')
    print('.globl calc')
    print('calc:')
    print('  pushq %rbp')
    print('  movq  %rsp, %rbp')
    print('  subq  $512, %rsp')
    print('\n'.join(body))
    print('  movq %rbp, %rsp')
    print('  popq %rbp')
    print('  ret')
    print('.section .rodata')
    print('.Lfmt:')
    print('  .string "%d\\n"')

if __name__ == '__main__':
    main()
