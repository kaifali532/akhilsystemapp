import { Github, Linkedin, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-black/40 backdrop-blur-xl shrink-0">
      <div className="w-full px-6 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img 
            src="https://aghhis.in/images/login/akhil-logo.png" 
            alt="Akhil Logo" 
            className="h-6 w-auto object-contain dark:bg-white/90 dark:p-1 dark:rounded transition-all"
            loading="lazy"
          />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 focus:outline-none border-l border-slate-300 dark:border-slate-700 pl-4">
            Created by 
            <span className="font-bold text-slate-800 dark:text-slate-200 ml-1">Md Kaif</span>
            <span className="mx-2 opacity-50 hidden sm:inline-block">•</span>
            <span className="hidden sm:inline-block">© {currentYear}</span>
          </p>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/kaifali532"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-500 transition-all duration-300 hover:scale-[1.15] hover:drop-shadow-[0_0_8px_rgba(66,133,244,0.5)] flex items-center gap-2 text-sm font-bold group outline-none"
          >
            <Github className="w-5 h-5 group-hover:text-blue-500 group-focus-visible:text-blue-500 transition-colors" />
            <span className="hidden sm:inline-block group-hover:text-blue-500 group-focus-visible:text-blue-500 transition-colors">GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/md-kaif-8ab734264/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-500 transition-all duration-300 hover:scale-[1.15] hover:drop-shadow-[0_0_8px_rgba(66,133,244,0.5)] flex items-center gap-2 text-sm font-bold group outline-none"
          >
            <Linkedin className="w-5 h-5 group-hover:text-blue-500 group-focus-visible:text-blue-500 transition-colors" />
            <span className="hidden sm:inline-block group-hover:text-blue-500 group-focus-visible:text-blue-500 transition-colors">LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
