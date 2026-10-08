'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Send } from 'lucide-react';

const TO_EMAIL = 'mohabbat.bd2020@gmail.com';
// FormSubmit forwards the form to the address above — no backend needed on a static site.
// The very first submission asks for a one-time activation click in your inbox.
const ENDPOINT = `https://formsubmit.co/ajax/${TO_EMAIL}`;

type Status = 'idle' | 'sending' | 'sent' | 'error';

const field =
  'w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm sm:text-base text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/40 focus:bg-white/10';

export default function ContactPage() {
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get('_honey')) return; // bots fill the hidden field
    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
          _subject: `Portfolio message from ${data.get('name')}`,
          _replyto: data.get('email'),
          _template: 'table',
          _captcha: 'false',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === 'false' || json.success === false) throw new Error('send failed');
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="self-start w-full max-w-2xl mx-auto px-3 pt-20 pb-24 relative z-20">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </Link>

      <section className="mt-4 rounded-[1.75rem] border border-white/20 bg-white/10 p-2 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]">
        <div className="rounded-[1.25rem] bg-[#0b0b10]/90 p-5 sm:p-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">Contact</h1>
            <div className="flex-1 border-t border-dashed border-white/20" />
          </div>
          <p className="mt-3 text-sm sm:text-base text-white/60">
            Write your message below and it lands straight in my inbox.
          </p>

          {status === 'sent' ? (
            <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-6 py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" aria-hidden />
              <p className="text-lg font-semibold text-white">Message sent</p>
              <p className="text-sm text-white/60">Thanks for reaching out — I’ll reply to your email soon.</p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-2 text-sm text-white/70 underline underline-offset-4 hover:text-white"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {/* Honeypot: hidden from people, tempting to bots */}
              <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-white/80">Name</span>
                  <input name="name" type="text" required maxLength={100} autoComplete="name" placeholder="Your name" className={field} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-white/80">Email</span>
                  <input name="email" type="email" required maxLength={150} autoComplete="email" placeholder="you@example.com" className={field} />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-white/80">Message</span>
                <textarea name="message" required rows={7} maxLength={5000} placeholder="What would you like to say?" className={`${field} resize-y`} />
              </label>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/85 disabled:opacity-60"
                >
                  {status === 'sending' ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden />
                  )}
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </button>

                {status === 'error' && (
                  <p role="alert" className="text-sm text-red-300">
                    Couldn’t send that. Try again, or email{' '}
                    <a href={`mailto:${TO_EMAIL}`} className="underline underline-offset-4">
                      {TO_EMAIL}
                    </a>
                    .
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
