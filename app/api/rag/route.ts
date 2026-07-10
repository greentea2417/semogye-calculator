import { spawn } from 'child_process';
import { NextResponse } from 'next/server';
import path from 'path';

export const runtime = 'nodejs';

function runPython(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const script = path.join(process.cwd(), 'scripts', 'rag_api.py');
    const proc = spawn('python', [script], {
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `python exited with code ${code}`));
        return;
      }
      resolve(stdout);
    });
    proc.stdin.end(question);
  });
}

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ ok: false, error: 'question is required' }, { status: 400 });
    }
    const raw = await runPython(question);
    return NextResponse.json(JSON.parse(raw));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
