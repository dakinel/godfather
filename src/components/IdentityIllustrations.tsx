import React from 'react';

export type IdentityType = 'builder' | 'doctor' | 'teacher';

interface IdentityIllustrationProps {
  type: IdentityType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const IdentityIllustration: React.FC<IdentityIllustrationProps> = ({
  type,
  size = 'md',
  className = ''
}) => {
  // Scaling factors based on native dimension (~260x360)
  const scaleMap = {
    sm: 0.32,  // ~84px x 115px
    md: 0.48,  // ~125px x 172px
    lg: 0.72   // ~187px x 260px
  };

  const scale = scaleMap[size];
  const width = Math.round(260 * scale);
  const height = Math.round(360 * scale);

  return (
    <div
      className={`relative overflow-hidden select-none flex items-center justify-center ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div
        className="absolute origin-top-left pointer-events-none"
        style={{
          width: '260px',
          height: '360px',
          transform: `scale(${scale})`,
          top: 0,
          left: 0
        }}
      >
        {type === 'builder' && <BuilderIllustration />}
        {type === 'doctor' && <DoctorIllustration />}
        {type === 'teacher' && <TeacherIllustration />}
      </div>
    </div>
  );
};

/* --- 1. BUILDER ILLUSTRATION --- */
function BuilderIllustration() {
  return (
    <div className="relative w-[260px] h-[360px] flex justify-center items-end">
      {/* Amber Glow Backdrop */}
      <div
        className="absolute w-[240px] h-[240px] rounded-full top-[10px] z-0"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, transparent 70%)'
        }}
      />

      {/* Torso & Attire */}
      <div className="absolute bottom-0 w-[260px] h-[190px] z-10">
        <div
          className="absolute bottom-0 left-[15px] w-[230px] h-[150px] rounded-t-[120px] border-t border-amber-300/50"
          style={{
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            boxShadow: 'inset 0 10px 20px rgba(255, 255, 255, 0.15)'
          }}
        >
          {/* Reflective Stripes */}
          <div className="absolute top-[20px] left-[55px] w-[25px] h-[130px] bg-slate-50 opacity-90 -skew-x-[10deg]" />
          <div className="absolute top-[20px] right-[55px] w-[25px] h-[130px] bg-slate-50 opacity-90 skew-x-[10deg]" />
        </div>
        <div
          className="absolute bottom-0 left-[25px] w-[210px] h-[120px] rounded-t-[90px] shadow-md"
          style={{ background: 'linear-gradient(to bottom, #334155, #1e293b)' }}
        >
          <div
            className="absolute top-0 left-[75px] w-[60px] h-[50px] bg-slate-900"
            style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
          />
        </div>
      </div>

      {/* Hammer in hand */}
      <div className="absolute bottom-[40px] -right-[15px] w-[50px] h-[140px] -rotate-[25deg] z-20">
        <div
          className="absolute bottom-0 left-[20px] w-[12px] h-[110px] rounded-md shadow-md"
          style={{ background: 'linear-gradient(to right, #78350f, #92400e, #451a03)' }}
        />
        <div
          className="absolute top-0 left-[2px] w-[48px] h-[22px] rounded-sm shadow-sm"
          style={{ background: 'linear-gradient(135deg, #cbd5e1, #475569)' }}
        />
      </div>

      {/* Neck */}
      <div
        className="absolute bottom-[120px] left-[110px] w-[40px] h-[60px] rounded-md z-10"
        style={{ background: 'linear-gradient(to right, #d97706, #b45309, #92400e)' }}
      />

      {/* Head Group */}
      <div className="absolute bottom-[150px] left-[70px] w-[120px] h-[150px] z-20">
        <div className="absolute top-[60px] -left-[5px] w-[18px] h-[28px] bg-[#b45309] rounded-l-full" />
        <div className="absolute top-[60px] -right-[5px] w-[18px] h-[28px] bg-[#92400e] rounded-r-full" />
        <div
          className="absolute top-[25px] left-[15px] w-[90px] h-[110px] rounded-[45px_45px_50px_50px]"
          style={{
            background: 'linear-gradient(145deg, #fcd34d, #f59e0b)',
            boxShadow: 'inset 0 -10px 15px rgba(0,0,0,0.1)'
          }}
        >
          <div className="absolute bottom-[22px] left-[35px] w-[20px] h-[8px] border-b-[2.5px] border-[#78350f] rounded-b-md" />
        </div>
        {/* Hard Hat */}
        <div
          className="absolute -top-[15px] left-0 w-[120px] h-[50px] rounded-[60px_60px_10px_10px] shadow-lg z-30"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
        />
        <div className="absolute top-[25px] -left-[10px] w-[140px] h-[12px] bg-[#f59e0b] rounded-md shadow-md z-30" />
        {/* Safety Glasses */}
        <div
          className="absolute top-[60px] left-[18px] w-[84px] h-[24px] rounded-xl border-2 border-sky-600 shadow-sm z-30"
          style={{ background: 'rgba(56, 189, 248, 0.3)' }}
        />
      </div>
    </div>
  );
}

/* --- 2. DOCTOR ILLUSTRATION --- */
function DoctorIllustration() {
  return (
    <div className="relative w-[260px] h-[360px] flex justify-center items-end">
      {/* Blue Glow Backdrop */}
      <div
        className="absolute w-[240px] h-[240px] rounded-full top-[10px] z-0"
        style={{
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, transparent 70%)'
        }}
      />

      {/* Torso & Lab Coat */}
      <div className="absolute bottom-0 w-[260px] h-[190px] z-10">
        <div
          className="absolute bottom-0 left-[15px] w-[230px] h-[150px] rounded-t-[120px]"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #0f172a)' }}
        />
        <div
          className="absolute bottom-0 left-[20px] w-[220px] h-[140px] rounded-t-[100px] shadow-sm"
          style={{ background: 'linear-gradient(to bottom, #ffffff, #f1f5f9)' }}
        >
          <div className="absolute top-0 left-[55px] w-[45px] h-[110px] bg-white -skew-x-[15deg] rounded-br-lg shadow-sm" />
          <div className="absolute top-0 right-[55px] w-[45px] h-[110px] bg-slate-200 skew-x-[15deg] rounded-bl-lg shadow-sm" />
          <div
            className="absolute top-0 left-[70px] w-[80px] h-[90px] bg-slate-800"
            style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
          />
          <div
            className="absolute top-0 left-[95px] w-[70px] h-[50px] bg-white"
            style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
          />
          <div
            className="absolute top-[15px] left-[122px] w-[16px] h-[80px]"
            style={{
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 50% 85%, 0% 100%)'
            }}
          />
        </div>

        {/* Stethoscope */}
        <div className="absolute top-[45px] left-[75px] w-[110px] h-[90px] border-4 border-slate-700 border-t-0 rounded-b-[60px] z-20" />
        <div
          className="absolute bottom-[25px] left-[120px] w-[24px] h-[24px] rounded-full border-[3px] border-slate-900 shadow-md z-30"
          style={{ background: 'linear-gradient(135deg, #cbd5e1, #64748b)' }}
        />
      </div>

      {/* Neck */}
      <div
        className="absolute bottom-[120px] left-[110px] w-[40px] h-[60px] rounded-md z-10"
        style={{ background: 'linear-gradient(to right, #f6ad55, #ed8936, #dd6b20)' }}
      />

      {/* Head Group */}
      <div className="absolute bottom-[150px] left-[70px] w-[120px] h-[150px] z-20">
        <div className="absolute top-[60px] -left-[5px] w-[18px] h-[28px] bg-[#ed8936] rounded-l-full" />
        <div className="absolute top-[60px] -right-[5px] w-[18px] h-[28px] bg-[#dd6b20] rounded-r-full" />
        <div
          className="absolute top-[25px] left-[15px] w-[90px] h-[110px] rounded-[45px_45px_50px_50px]"
          style={{
            background: 'linear-gradient(145deg, #fbd38d, #f6ad55)',
            boxShadow: 'inset 0 -10px 15px rgba(0,0,0,0.05)'
          }}
        >
          <div className="absolute bottom-[22px] left-[35px] w-[20px] h-[8px] border-b-[2.5px] border-[#9a3412] rounded-b-md" />
        </div>
        {/* Hair */}
        <div className="absolute top-[15px] left-[12px] w-[96px] h-[50px] bg-slate-800 rounded-t-[50px] rounded-b-[20px] z-20" />
        <div className="absolute top-[10px] left-[20px] w-[80px] h-[35px] bg-slate-900 rounded-t-[40px] rounded-b-[10px] -rotate-[3deg] z-30" />
        {/* Doctor Glasses */}
        <div className="absolute top-[62px] left-[22px] w-[76px] h-[26px] flex justify-between z-30">
          <div className="w-[32px] h-[26px] border-[2.5px] border-sky-500 rounded-md bg-sky-500/10 shadow-inner" />
          <div className="w-[32px] h-[26px] border-[2.5px] border-sky-500 rounded-md bg-sky-500/10 shadow-inner" />
          <div className="absolute top-[8px] left-[32px] w-[12px] h-[2px] bg-sky-500" />
        </div>
      </div>
    </div>
  );
}

/* --- 3. TEACHER ILLUSTRATION --- */
function TeacherIllustration() {
  return (
    <div className="relative w-[260px] h-[360px] flex justify-center items-end">
      {/* Purple Glow Backdrop */}
      <div
        className="absolute w-[240px] h-[240px] rounded-full top-[10px] z-0"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, transparent 70%)'
        }}
      />

      {/* Mini Chalkboard Element on Left Side */}
      <div
        className="absolute left-[2px] bottom-[30px] w-[80px] h-[130px] rounded-sm border-4 border-amber-900 shadow-md z-10 hidden sm:block"
        style={{ backgroundColor: '#234e32' }}
      >
        <div className="p-1 text-[8px] font-mono text-white/80 leading-tight">
          E=mc²
          <br />
          a²+b²=c²
          <br />
          ✓ A+
        </div>
        <div className="absolute -bottom-[6px] -left-[2px] w-[84px] h-[4px] bg-amber-800 rounded-xs" />
      </div>

      {/* Torso & Blazer */}
      <div className="absolute bottom-0 w-[260px] h-[190px] z-10">
        <div
          className="absolute bottom-0 left-[15px] w-[230px] h-[150px] rounded-t-[120px]"
          style={{ background: 'linear-gradient(135deg, #3b0764, #581c87)' }}
        />
        <div
          className="absolute bottom-0 left-[20px] w-[220px] h-[130px] rounded-t-[100px] shadow-sm"
          style={{ background: 'linear-gradient(to bottom, #ffffff, #f3e8ff)' }}
        >
          <div className="absolute top-0 left-[45px] w-[55px] h-[120px] bg-[#4c1d95] -skew-x-[15deg] rounded-br-lg shadow-sm" />
          <div className="absolute top-0 right-[45px] w-[55px] h-[120px] bg-[#6b21a8] skew-x-[15deg] rounded-bl-lg shadow-sm" />
          <div
            className="absolute top-0 left-[85px] w-[90px] h-[70px] bg-slate-800"
            style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
          />
          {/* Gold Necklace */}
          <div className="absolute top-[42px] left-[110px] w-[40px] h-[20px] border-2 border-amber-400 border-t-0 rounded-b-full z-20" />
        </div>
      </div>

      {/* Neck */}
      <div
        className="absolute bottom-[120px] left-[110px] w-[40px] h-[60px] rounded-md z-10"
        style={{ background: 'linear-gradient(to right, #f6ad55, #ed8936, #dd6b20)' }}
      />

      {/* Head Group */}
      <div className="absolute bottom-[150px] left-[70px] w-[120px] h-[150px] z-20">
        {/* Hair Bun */}
        <div className="absolute -top-[5px] left-[45px] w-[30px] h-[30px] bg-[#1e1b4b] rounded-full z-10" />
        <div className="absolute top-[60px] -left-[5px] w-[18px] h-[28px] bg-[#ed8936] rounded-l-full" />
        <div className="absolute top-[60px] -right-[5px] w-[18px] h-[28px] bg-[#dd6b20] rounded-r-full" />
        <div
          className="absolute top-[25px] left-[15px] w-[90px] h-[110px] rounded-[45px_45px_50px_50px]"
          style={{
            background: 'linear-gradient(145deg, #fbd38d, #f6ad55)',
            boxShadow: 'inset 0 -10px 15px rgba(0,0,0,0.05)'
          }}
        >
          <div className="absolute bottom-[22px] left-[35px] w-[20px] h-[8px] border-b-[2.5px] border-[#9a3412] rounded-b-md" />
        </div>
        {/* Teacher Hair */}
        <div className="absolute top-[15px] left-[10px] w-[100px] h-[60px] bg-[#1e1b4b] rounded-t-[50px] rounded-b-[20px] z-20" />
        {/* Round Golden Glasses */}
        <div className="absolute top-[62px] left-[22px] w-[76px] h-[26px] flex justify-between z-30">
          <div className="w-[32px] h-[26px] border-[2.5px] border-amber-400 rounded-full bg-amber-400/10 shadow-inner" />
          <div className="w-[32px] h-[26px] border-[2.5px] border-amber-400 rounded-full bg-amber-400/10 shadow-inner" />
          <div className="absolute top-[8px] left-[32px] w-[12px] h-[2px] bg-amber-400" />
        </div>
      </div>
    </div>
  );
}
