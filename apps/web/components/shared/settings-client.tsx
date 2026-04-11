"use client";

import { useState, useEffect } from "react";
import { Settings, Search, User, Lock, Bell, Info } from "lucide-react";
import { Button } from "@examcraft/ui";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { useInstitution } from "@/hooks/use-institution";

export function SettingsClient() {
  const { institutionId } = useInstitution();
  const [searchQuery, setSearchQuery] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("test");
  const [role, setRole] = useState("faculty");
  
  // Toggle states
  const [notifyApproved, setNotifyApproved] = useState(true);
  const [notifyRejected, setNotifyRejected] = useState(true);
  const [notifyTips, setNotifyTips] = useState(false);

  useEffect(() => {
    getSupabaseBrowserSession().then(session => {
       if (session?.user) {
         setEmail(session.user.email || "");
         const user: any = session.user;
         setUserName(user.user_metadata?.full_name || user.email || "test");
         setRole(user.user_metadata?.role || "faculty");
       }
    });
  }, []);

  const CustomToggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${checked ? 'bg-[#7c3aed]' : 'bg-slate-700'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="flex flex-col w-full max-w-[900px] gap-8 mx-auto pb-20 mt-[-10px] text-slate-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <Settings size={28} className="text-[#c4b5fd]" />
            <div className="flex flex-col gap-1">
               <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
               <p className="text-slate-400 text-sm font-medium">
                 Manage your profile, password, and preferences.
               </p>
            </div>
         </div>
         
         {/* Search Box */}
         <div className="relative w-full md:w-64">
             <input
               type="text"
               placeholder="Search..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#1e293b]/70 border border-slate-700/50 text-slate-300 placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors shadow-sm"
             />
             <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
         </div>
      </div>

      {/* Profile Header Box */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#1e293b] border border-[#2b3952] shadow-sm">
         <div className="w-14 h-14 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-2xl font-black shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            {userName[0]?.toUpperCase() || "T"}
         </div>
         <div className="flex flex-col">
            <span className="text-xl font-bold text-white tracking-tight">{userName}</span>
            <span className="text-sm font-medium text-slate-400">{email || "test@gmail.com"} · <span className="text-indigo-400">{role}</span></span>
         </div>
      </div>

      {/* Main Settings Blocks */}
      <div className="flex flex-col gap-8">
        
        {/* Profile Details */}
        <div className="flex flex-col rounded-2xl bg-[#1e293b]/90 border border-[#2b3952] shadow-sm p-6 gap-6">
           <div className="flex items-center gap-3 border-b border-[#2b3952]/50 pb-4">
              <User size={20} className="text-[#a78bfa]" />
              <div className="flex flex-col">
                 <h2 className="text-lg font-bold text-white tracking-tight">Profile</h2>
                 <p className="text-xs text-slate-400">Your name and default context for generating papers.</p>
              </div>
           </div>
           
           <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Display Name</label>
                 <input type="text" defaultValue={userName} className="h-11 rounded-lg bg-[#0f172a]/50 border border-slate-700/60 px-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Default Department</label>
                   <select className="h-11 rounded-lg bg-[#0f172a]/50 border border-slate-700/60 px-4 text-sm text-slate-300 appearance-none focus:outline-none focus:border-indigo-500/50 relative cursor-pointer">
                      <option>Computer Science Engineering</option>
                      <option>Computer Science</option>
                   </select>
                 </div>
                 <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Default Subject</label>
                   <select className="h-11 rounded-lg bg-[#0f172a]/50 border border-slate-700/60 px-4 text-sm text-slate-300 appearance-none focus:outline-none focus:border-indigo-500/50 relative cursor-pointer">
                      <option>None</option>
                      <option>Subject A</option>
                   </select>
                 </div>
              </div>
           </div>

           <div>
              <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] px-6 text-white font-bold h-10 shadow-[0_0_15px_rgba(124,58,237,0.2)]">Save Profile</Button>
           </div>
        </div>

        {/* Change Password */}
        <div className="flex flex-col rounded-2xl bg-[#1e293b]/90 border border-[#2b3952] shadow-sm p-6 gap-6">
           <div className="flex items-center gap-3 border-b border-[#2b3952]/50 pb-4">
              <Lock size={20} className="text-amber-400" />
              <div className="flex flex-col">
                 <h2 className="text-lg font-bold text-white tracking-tight">Change Password</h2>
                 <p className="text-xs text-slate-400">Re-authentication required to change your password.</p>
              </div>
           </div>
           
           <div className="flex flex-col gap-5 max-w-md">
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Current Password</label>
                 <input type={showPasswords ? "text" : "password"} placeholder="••••••••" className="h-11 rounded-lg bg-[#0f172a]/50 border border-slate-700/60 px-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">New Password</label>
                 <input type={showPasswords ? "text" : "password"} placeholder="••••••••" className="h-11 rounded-lg bg-[#0f172a]/50 border border-slate-700/60 px-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Confirm New Password</label>
                 <input type={showPasswords ? "text" : "password"} placeholder="••••••••" className="h-11 rounded-lg bg-[#0f172a]/50 border border-slate-700/60 px-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50" />
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer mt-1 group">
                 <div className="relative flex items-center justify-center w-4 h-4 border border-slate-600 rounded bg-[#0f172a]/50 group-hover:border-indigo-500 transition-colors">
                    <input 
                      type="checkbox" 
                      className="absolute opacity-0 w-full h-full cursor-pointer" 
                      checked={showPasswords}
                      onChange={(e) => setShowPasswords(e.target.checked)}
                    />
                    {showPasswords && <div className="w-2 h-2 bg-indigo-500 rounded-sm" />}
                 </div>
                 <span className="text-xs text-slate-400 font-medium">Show passwords</span>
              </label>
           </div>

           <div>
              <Button className="bg-[#4338ca] hover:bg-[#3730a3] px-6 text-white font-bold h-10 shadow-none border border-indigo-500/20">Update Password</Button>
           </div>
        </div>

        {/* Notification Preferences */}
        <div className="flex flex-col rounded-2xl bg-[#1e293b]/90 border border-[#2b3952] shadow-sm p-6 gap-6">
           <div className="flex items-center gap-3 border-b border-[#2b3952]/50 pb-4">
              <Bell size={20} className="text-orange-400" />
              <div className="flex flex-col">
                 <h2 className="text-lg font-bold text-white tracking-tight">Notification Preferences</h2>
                 <p className="text-xs text-slate-400">Control which in-app notifications you see on your dashboard.</p>
              </div>
           </div>
           
           <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-200">Question approved</span>
                    <span className="text-xs text-slate-500">Show a notice when your submitted question is approved by admin.</span>
                 </div>
                 <CustomToggle checked={notifyApproved} onChange={() => setNotifyApproved(!notifyApproved)} />
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-200">Question rejected</span>
                    <span className="text-xs text-slate-500">Show a notice when a submission is rejected with a review note.</span>
                 </div>
                 <CustomToggle checked={notifyRejected} onChange={() => setNotifyRejected(!notifyRejected)} />
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-200">Tips & suggestions</span>
                    <span className="text-xs text-slate-500">Occasional tips about improving question quality and coverage.</span>
                 </div>
                 <CustomToggle checked={notifyTips} onChange={() => setNotifyTips(!notifyTips)} />
              </div>
           </div>

           <div className="pt-2">
              <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] px-6 text-white font-bold h-10 shadow-[0_0_15px_rgba(124,58,237,0.2)]">Save Preferences</Button>
           </div>
        </div>

        {/* Account Info (Admin Managed) - Customized for Multi-Tenant */}
        <div className="flex flex-col rounded-2xl bg-[#1e293b]/90 border border-[#2b3952] shadow-sm p-6 gap-6">
           <div className="flex items-center gap-3 border-b border-[#2b3952]/50 pb-4">
              <div className="bg-blue-500 text-white rounded p-1 w-6 h-6 flex items-center justify-center font-bold font-serif text-sm">i</div>
              <div className="flex flex-col">
                 <h2 className="text-lg font-bold text-white tracking-tight">Account Info</h2>
                 <p className="text-xs text-slate-400">These fields are managed by your institution administrator.</p>
              </div>
           </div>
           
           <div className="flex flex-col gap-5 text-slate-500">
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Email</label>
                   <input disabled type="text" value={email || "test@gmail.com"} className="h-11 rounded-lg bg-[#0f172a]/30 border border-slate-700/30 px-4 text-sm text-slate-500 opacity-60 cursor-not-allowed" />
                 </div>
                 <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Role</label>
                   <input disabled type="text" value={role} className="h-11 rounded-lg bg-[#0f172a]/30 border border-slate-700/30 px-4 text-sm text-slate-500 opacity-60 cursor-not-allowed" />
                 </div>
              </div>
              
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Institution Tenant</label>
                 <div className="h-11 rounded-lg bg-[#0f172a]/30 border border-slate-700/30 px-4 flex items-center gap-3 text-sm text-slate-400 opacity-80 cursor-not-allowed">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-black">ID</div>
                    {institutionId || "Global Sandbox"}
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Assigned Subjects</label>
                 <div className="min-h-[44px] py-3 rounded-lg bg-[#0f172a]/30 border border-slate-700/30 px-4 text-sm text-slate-500 opacity-60 cursor-not-allowed">
                    Distributed Systems, Social Computing, Natural Language Processing, Dsa
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Assigned Semesters</label>
                 <input disabled type="text" value="Semester 8" className="h-11 rounded-lg bg-[#0f172a]/30 border border-slate-700/30 px-4 text-sm text-slate-500 opacity-60 cursor-not-allowed" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
