"use client";

import * as React from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { motion } from "framer-motion";
import { Sparkles, Command, Moon, PlusCircle } from "lucide-react";
import { toast } from "sonner";

const KEY = "alhana.onboarding.done";

export function Onboarding() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const done = localStorage.getItem(KEY) === "true";
    if (!done) setOpen(true);
  }, []);

  function finish() {
    localStorage.setItem(KEY, "true");
    setOpen(false);
    toast("مرحبًا بك في Alhana Logistique", { description: "جاهز لإدارة الطلبات والأسطول." });
  }

  return (
    <Transition show={open} as={React.Fragment}>
      <Dialog onClose={() => setOpen(false)} className="relative z-[70]">
        <TransitionChild as={React.Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto px-4 py-10 sm:py-16">
          <div className="mx-auto w-full max-w-lg">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2 scale-[0.98]"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-2 scale-[0.98]"
            >
              <DialogPanel className="gradient-border">
                <div className="glass rounded-[1.25rem] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-card/60 shadow-sm">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-base font-extrabold tracking-tight">مرحبًا بك</div>
                        <div className="text-xs text-muted-foreground">Onboarding سريع — 20 ثانية</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={finish}
                      className="rounded-xl border bg-card/60 px-3 py-1 text-xs font-semibold hover:bg-muted"
                    >
                      تخطي
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">
                    <Tip
                      icon={<Command className="h-4 w-4" />}
                      title="بحث عالمي"
                      text="اضغط Ctrl/⌘+K للبحث السريع والتنقل."
                    />
                    <Tip
                      icon={<PlusCircle className="h-4 w-4" />}
                      title="Quick Actions"
                      text="زر طلب جديد ثابت أسفل الشاشة لتسريع العمل."
                    />
                    <Tip
                      icon={<Moon className="h-4 w-4" />}
                      title="Dark Mode"
                      text="الثيم يتبع النظام ويمكنك تغييره من أعلى الصفحة."
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={finish}
                      className="h-11 rounded-2xl bg-gradient-to-r from-[#0a8e42] via-[#4ea8c0] to-[#eadf76] px-5 text-sm font-extrabold text-[#0b1220] shadow-luxury"
                    >
                      ابدأ الآن
                    </motion.button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function Tip({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border bg-background/40 p-4">
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border bg-card/60 shadow-sm">
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold">{title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{text}</div>
      </div>
    </div>
  );
}

