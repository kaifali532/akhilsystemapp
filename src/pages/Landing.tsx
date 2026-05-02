import { motion } from 'motion/react';
import { NavLink } from 'react-router';
import { ArrowRight, Activity, Clock, ShieldCheck, Users, Stethoscope, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Footer } from '../components/Footer';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-500 overflow-x-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 glass-header border-b border-transparent backdrop-blur-xl bg-white/60 dark:bg-black/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
              Akhil Systems
            </span>
          </div>
          <div className="flex gap-4">
            <NavLink to="/login">
              <Button variant="ghost" className="rounded-full font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
                Sign In
              </Button>
            </NavLink>
            <NavLink to="/login">
              <Button className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-lg shadow-blue-500/20 px-6 font-semibold transition-all hover:scale-105 active:scale-95 duration-200">
                Get Started
              </Button>
            </NavLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center space-y-10"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 font-medium text-sm shadow-sm backdrop-blur-md">
          <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Introducing Smart OPD Optimizer
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black tracking-tighter max-w-4xl leading-[1.1] text-slate-900 dark:text-white">
          Hospital queuing,<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">beautifully reimagined.</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
          Streamline patient flow, minimize waiting times, and optimize clinical operations with our intelligent, real-time OPD management system.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-8">
          <NavLink to="/login">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white text-lg font-bold shadow-[0_8px_30px_rgb(66,133,244,0.3)] hover:shadow-[0_10px_40px_rgb(66,133,244,0.5)] transition-all hover:-translate-y-1">
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </NavLink>
          <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-full border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/50 backdrop-blur-xl text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
            View Live Demo
          </Button>
        </motion.div>

        {/* Dashboard Preview Mockup */}
        <motion.div 
          variants={itemVariants}
          className="relative w-full max-w-5xl mx-auto mt-20 pt-10"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5F7] dark:from-[#000000] via-transparent to-transparent z-10 h-full w-full"></div>
          <div className="rounded-[2.5rem] border border-white dark:border-slate-800 bg-white/50 dark:bg-[#1A1A1C]/50 backdrop-blur-2xl p-4 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-white/40 dark:from-white/5 to-transparent pointer-events-none rounded-t-[2.2rem]"></div>
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000" alt="Dashboard Interface" className="rounded-[1.5rem] shadow-sm w-full object-cover aspect-[16/9] opacity-90 group-hover:opacity-100 transition-opacity duration-500 object-top grayscale-[20%] group-hover:grayscale-0" />
            
            {/* Overlay UI elements to make it feel like the app */}
            <div className="absolute top-10 left-10 p-4 bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce" style={{animationDuration: '3s'}}>
               <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                 <Check className="w-5 h-5 text-green-500" />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Queue Status</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white">Optimized</p>
               </div>
            </div>

            <div className="absolute bottom-20 right-10 p-4 bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>
               <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                 <Users className="w-5 h-5 text-blue-500" />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Patients Wait</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white">12 mins avg</p>
               </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="py-24 px-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              Everything you need.<br/>Nothing you don't.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl mx-auto">
              Designed specifically for modern healthcare facilities to reduce friction and improve patient satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: 'Real-time Tracking', desc: 'Monitor patient flow and queue status instantly across all departments with zero lag.' },
              { icon: Clock, title: 'Smart Pre-booking', desc: 'Allow patients to book slots online to minimize physical waiting room congestion.' },
              { icon: ShieldCheck, title: 'Secure & Compliant', desc: 'Enterprise-grade security ensuring patient data remains private and protected.' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white/40 dark:bg-[#1A1A1C]/60 backdrop-blur-xl border border-white/60 dark:border-slate-800 p-8 rounded-[2rem] hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-500 text-slate-600 dark:text-slate-300 group-hover:text-white">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative z-20">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-500/30">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            Ready to upgrade your OPD?
          </h2>
          <p className="text-blue-100 font-medium text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Join hundreds of clinics transforming their patient experience with our intelligent queue management system.
          </p>
          <NavLink to="/login">
            <Button size="lg" className="h-16 px-10 rounded-full bg-white text-blue-600 hover:bg-slate-50 text-xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">
              Get Started for Free
            </Button>
          </NavLink>
        </div>
      </section>

      <Footer />
    </div>
  );
}
