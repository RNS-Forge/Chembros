import heroImg from '../assets/hero.png'
import NavBar from './NavBar'

export default function Homehero() {
    return (
        <section className="w-full bg-white flex justify-center overflow-x-hidden">
            <div
                className="w-[1920px] h-[1080px] relative bg-white overflow-hidden origin-top"
                style={{
                    transform: 'scale(min(1, calc(100vw / 1920)))',
                    marginBottom: 'calc(1080px * (min(1, calc(100vw / 1920)) - 1))',
                }}
            >
                {/* Top Floating Navigation Pill with consistent 172px left margin */}
                <div className="left-[172px] top-[48px] absolute z-50">
                    <NavBar />
                </div>
                <div className="w-[1920px] h-[1080px] left-0 top-0 absolute"></div>
                <div className="w-[1576px] h-[1080px] left-[172px] top-0 absolute overflow-hidden">
                <img
                    className="w-[1516px] h-[1080px] left-[30px] top-0 absolute object-contain"
                    src={heroImg}
                    alt="Chembros Hero"
                />
                <div className="w-[1576px] h-[811px] left-0 top-[269px] absolute overflow-hidden">
                    <div className="w-[1576px] h-28 left-0 top-0 absolute overflow-hidden">
                        <div className="w-[533px] left-0 top-0 absolute justify-center text-black text-5xl font-normal font-['Conquera',sans-serif] leading-[59.36px] uppercase tracking-wider">
                            Chemistry captured
                        </div>
                        <div className="w-96 left-[1212px] top-0 absolute justify-center text-black text-5xl font-normal font-['Conquera',sans-serif] leading-[59.36px] uppercase tracking-wider">
                            in a <br />bottle.
                        </div>
                    </div>
                    <div className="w-[1258px] h-[640px] left-[159px] top-[171px] absolute overflow-hidden">
                        {/* Bottle 4 */}
                        <div className="w-60 h-96 left-[1021px] top-[14px] absolute overflow-hidden">
                            <div className="w-80 h-96 left-[-40px] top-[-28px] absolute overflow-hidden">
                                <div className="w-32 h-28 left-[92.09px] top-[48.56px] absolute"></div>
                                <div className="w-32 h-28 left-[92.09px] top-[48.56px] absolute bg-gradient-to-r from-zinc-950/90 via-gray-800/30 via 25% to-zinc-950/90"></div>
                                <div className="w-32 h-6 left-[92.09px] top-[35.86px] absolute bg-radial from-neutral-700 via-zinc-900 via 70% to-neutral-950 outline outline-[0.79px] outline-offset-[-0.40px] outline-zinc-800"></div>
                                <div className="w-24 h-4 left-[111.14px] top-[39.83px] absolute opacity-60 outline outline-[0.79px] outline-offset-[-0.40px] outline-gray-800"></div>
                                <div className="w-14 h-2.5 left-[130.99px] top-[43.80px] absolute opacity-70 outline outline-[0.64px] outline-offset-[-0.32px] outline-zinc-700"></div>
                                <div className="w-6 h-28 left-[100.03px] top-[51.74px] absolute outline outline-2 outline-offset-[-0.99px] outline-white/20"></div>
                                <div className="w-20 h-3 left-[117.50px] top-[157.32px] absolute bg-gradient-to-r from-gray-600 via-white via 25% to-gray-700 outline outline-[0.79px] outline-offset-[-0.40px] outline-white/70"></div>
                                <div className="w-2.5 h-6 left-[154.02px] top-[166.06px] absolute opacity-90 bg-slate-100 outline outline-[0.64px] outline-offset-[-0.32px] outline-white"></div>
                                <div className="w-[3.18px] h-44 left-[158.78px] top-[191.46px] absolute outline outline-[1.43px] outline-offset-[-0.71px] outline-white/75"></div>
                                <div className="w-[3.18px] h-44 left-[159.57px] top-[191.46px] absolute outline outline-[0.64px] outline-offset-[-0.32px] outline-black/20"></div>
                                <div className="w-56 h-52 left-[48.98px] top-[172.41px] absolute bg-gradient-to-b from-orange-100/30 via-amber-200/50 via 35% to-yellow-600/80"></div>
                                <div className="w-56 h-52 left-[48.98px] top-[172.41px] absolute opacity-80 bg-radial-[at_50%_60%] from-white/40 via-white/10 via 45% to-white/0"></div>
                                <div className="w-20 h-2.5 left-[117.50px] top-[167.65px] absolute bg-white/50"></div>
                                <div className="w-20 h-0.5 left-[117.50px] top-[172.41px] absolute opacity-80 outline outline-[1.19px] outline-offset-[-0.60px] outline-white"></div>
                                <div className="w-56 h-7 left-[47.09px] top-[358.18px] absolute bg-gradient-to-b from-white/60 via-slate-300/20 via 45% to-slate-400/40 outline outline-1 outline-offset-[-0.48px] outline-white/70"></div>
                                <div className="w-44 h-[4.76px] left-[67.48px] top-[380.41px] absolute opacity-90 outline outline-2 outline-offset-[-0.99px] outline-white"></div>
                                <div className="w-40 h-1 left-[77.80px] top-[383.59px] absolute outline outline-[0.79px] outline-offset-[-0.40px] outline-black/25"></div>
                                <div className="size-60 left-[39.91px] top-[160.90px] absolute bg-linear-43 from-white/30 via-white/10 via 20% to-white/40 outline outline-2 outline-offset-[-0.87px] outline-white/90"></div>
                                <div className="w-20 h-48 left-[44.46px] top-[166.06px] absolute opacity-90 outline outline-[3.18px] outline-offset-[-1.59px] outline-white"></div>
                                <div className="w-16 h-48 left-[52.40px] top-[167.65px] absolute opacity-40 outline outline-[1.19px] outline-offset-[-0.60px] outline-white"></div>
                                <div className="w-20 h-48 left-[200.06px] top-[166.06px] absolute opacity-75 outline outline-[2.38px] outline-offset-[-1.19px] outline-white"></div>
                                <div className="w-16 h-48 left-[196.09px] top-[167.65px] absolute opacity-30 outline outline-1 outline-offset-[-0.48px] outline-white"></div>
                                <div className="left-[137.35px] top-[271.65px] absolute text-center justify-start text-white text-[7.15px] font-normal font-['Inter']">
                                    CHEM BROS
                                </div>
                                <div className="left-[124.25px] top-[284.75px] absolute text-center justify-start text-white text-xs font-bold font-['Cinzel']">
                                    Molecule J
                                </div>
                                <div className="left-[129.37px] top-[304.99px] absolute text-center justify-start text-white/70 text-[5.56px] font-normal font-['Inter']">
                                    EXTRAIT DE PARFUM
                                </div>
                                <div className="left-[134.53px] top-[318.09px] absolute text-center justify-start text-white/50 text-[5.16px] font-normal font-['Inter']">
                                    MADURAI // 50 ML
                                </div>
                                <div className="w-16 h-52 left-[63.51px] top-[165.26px] absolute opacity-30"></div>
                            </div>
                        </div>

                        {/* Pedestal 1 */}
                        <div className="size-60 left-[4px] top-[396px] absolute bg-gradient-to-r from-slate-500 via-slate-300 via 18% to-slate-500 rounded-tl-[20px] rounded-tr-[20px] shadow-[0px_20px_40px_-14.999999046325684px_rgba(3,21,29,0.45)] shadow-[inset_0px_0.9999999403953552px_0px_0px_rgba(255,255,255,0.80)] border-l-1 border-r-1 border-gray-500 overflow-hidden">
                            <div className="w-9 h-60 left-[43.29px] top-0 absolute bg-white/25 blur-[0.50px]"></div>
                            <div className="w-12 h-60 left-[113.79px] top-0 absolute bg-white/30 blur-[1px]"></div>
                            <div className="w-7 h-60 left-[172.54px] top-0 absolute bg-black/20"></div>
                        </div>

                        {/* Bottle 1 */}
                        <div className="w-60 h-96 left-0 top-0 absolute overflow-hidden">
                            <div className="w-80 h-96 left-[-40px] top-[-28px] absolute overflow-hidden">
                                <div className="w-32 h-28 left-[92.09px] top-[48.56px] absolute"></div>
                                <div className="w-32 h-28 left-[92.09px] top-[48.56px] absolute bg-gradient-to-r from-zinc-950/90 via-gray-800/30 via 25% to-zinc-950/90"></div>
                                <div className="w-32 h-6 left-[92.09px] top-[35.86px] absolute bg-radial from-neutral-700 via-zinc-900 via 70% to-neutral-950 outline outline-[0.79px] outline-offset-[-0.40px] outline-zinc-800"></div>
                                <div className="w-24 h-4 left-[111.14px] top-[39.83px] absolute opacity-60 outline outline-[0.79px] outline-offset-[-0.40px] outline-gray-800"></div>
                                <div className="w-14 h-2.5 left-[130.99px] top-[43.80px] absolute opacity-70 outline outline-[0.64px] outline-offset-[-0.32px] outline-zinc-700"></div>
                                <div className="w-6 h-28 left-[100.03px] top-[51.74px] absolute outline outline-2 outline-offset-[-0.99px] outline-white/20"></div>
                                <div className="w-20 h-3 left-[117.50px] top-[157.32px] absolute bg-gradient-to-r from-gray-600 via-white via 25% to-gray-700 outline outline-[0.79px] outline-offset-[-0.40px] outline-white/70"></div>
                                <div className="w-2.5 h-6 left-[154.02px] top-[166.06px] absolute opacity-90 bg-slate-100 outline outline-[0.64px] outline-offset-[-0.32px] outline-white"></div>
                                <div className="w-[3.18px] h-44 left-[158.78px] top-[191.46px] absolute outline outline-[1.43px] outline-offset-[-0.71px] outline-white/75"></div>
                                <div className="w-[3.18px] h-44 left-[159.57px] top-[191.46px] absolute outline outline-[0.64px] outline-offset-[-0.32px] outline-black/20"></div>
                                <div className="w-56 h-52 left-[48.98px] top-[172.41px] absolute bg-gradient-to-b from-orange-100/30 via-amber-200/50 via 35% to-yellow-600/80"></div>
                                <div className="w-56 h-52 left-[48.98px] top-[172.41px] absolute opacity-80 bg-radial-[at_50%_60%] from-white/40 via-white/10 via 45% to-white/0"></div>
                                <div className="w-20 h-2.5 left-[117.50px] top-[167.65px] absolute bg-white/50"></div>
                                <div className="w-20 h-0.5 left-[117.50px] top-[172.41px] absolute opacity-80 outline outline-[1.19px] outline-offset-[-0.60px] outline-white"></div>
                                <div className="w-56 h-7 left-[47.09px] top-[358.18px] absolute bg-gradient-to-b from-white/60 via-slate-300/20 via 45% to-slate-400/40 outline outline-1 outline-offset-[-0.48px] outline-white/70"></div>
                                <div className="w-44 h-[4.76px] left-[67.48px] top-[380.41px] absolute opacity-90 outline outline-2 outline-offset-[-0.99px] outline-white"></div>
                                <div className="w-40 h-1 left-[77.80px] top-[383.59px] absolute outline outline-[0.79px] outline-offset-[-0.40px] outline-black/25"></div>
                                <div className="size-60 left-[39.91px] top-[160.90px] absolute bg-linear-43 from-white/30 via-white/10 via 20% to-white/40 outline outline-2 outline-offset-[-0.87px] outline-white/90"></div>
                                <div className="w-20 h-48 left-[44.46px] top-[166.06px] absolute opacity-90 outline outline-[3.18px] outline-offset-[-1.59px] outline-white"></div>
                                <div className="w-16 h-48 left-[52.40px] top-[167.65px] absolute opacity-40 outline outline-[1.19px] outline-offset-[-0.60px] outline-white"></div>
                                <div className="w-20 h-48 left-[200.06px] top-[166.06px] absolute opacity-75 outline outline-[2.38px] outline-offset-[-1.19px] outline-white"></div>
                                <div className="w-16 h-48 left-[196.09px] top-[167.65px] absolute opacity-30 outline outline-1 outline-offset-[-0.48px] outline-white"></div>
                                <div className="left-[137.35px] top-[271.65px] absolute text-center justify-start text-white text-[7.15px] font-normal font-['Inter']">
                                    CHEM BROS
                                </div>
                                <div className="left-[124.25px] top-[284.75px] absolute text-center justify-start text-white text-xs font-bold font-['Cinzel']">
                                    Molecule J
                                </div>
                                <div className="left-[129.37px] top-[304.99px] absolute text-center justify-start text-white/70 text-[5.56px] font-normal font-['Inter']">
                                    EXTRAIT DE PARFUM
                                </div>
                                <div className="left-[134.53px] top-[318.09px] absolute text-center justify-start text-white/50 text-[5.16px] font-normal font-['Inter']">
                                    MADURAI // 50 ML
                                </div>
                                <div className="w-16 h-52 left-[63.51px] top-[165.26px] absolute opacity-30"></div>
                            </div>
                        </div>

                        {/* Pedestal 2 */}
                        <div className="w-60 h-40 left-[330px] top-[487px] absolute bg-gradient-to-r from-slate-500 via-slate-300 via 18% to-slate-500 rounded-tl-[20px] rounded-tr-[20px] shadow-[0px_20px_40px_-14.999999046325684px_rgba(3,21,29,0.45)] shadow-[inset_0px_0.9999999403953552px_0px_0px_rgba(255,255,255,0.80)] border-l-1 border-r-1 border-gray-500 overflow-hidden">
                            <div className="w-9 h-40 left-[43.29px] top-0 absolute bg-white/25 blur-[0.50px]"></div>
                            <div className="w-12 h-40 left-[113.79px] top-0 absolute bg-white/30 blur-[1px]"></div>
                            <div className="w-7 h-40 left-[172.54px] top-0 absolute bg-black/20"></div>
                        </div>

                        {/* Bottle 2 */}
                        <div className="w-60 h-96 left-[331px] top-[85px] absolute overflow-hidden">
                            <div className="w-80 h-96 left-[-40px] top-[-28px] absolute overflow-hidden">
                                <div className="w-32 h-28 left-[92.09px] top-[48.56px] absolute"></div>
                                <div className="w-32 h-28 left-[92.09px] top-[48.56px] absolute bg-gradient-to-r from-zinc-950/90 via-gray-800/30 via 25% to-zinc-950/90"></div>
                                <div className="w-32 h-6 left-[92.09px] top-[35.86px] absolute bg-radial from-neutral-700 via-zinc-900 via 70% to-neutral-950 outline outline-[0.79px] outline-offset-[-0.40px] outline-zinc-800"></div>
                                <div className="w-24 h-4 left-[111.14px] top-[39.83px] absolute opacity-60 outline outline-[0.79px] outline-offset-[-0.40px] outline-gray-800"></div>
                                <div className="w-14 h-2.5 left-[130.99px] top-[43.80px] absolute opacity-70 outline outline-[0.64px] outline-offset-[-0.32px] outline-zinc-700"></div>
                                <div className="w-6 h-28 left-[100.03px] top-[51.74px] absolute outline outline-2 outline-offset-[-0.99px] outline-white/20"></div>
                                <div className="w-20 h-3 left-[117.50px] top-[157.32px] absolute bg-gradient-to-r from-gray-600 via-white via 25% to-gray-700 outline outline-[0.79px] outline-offset-[-0.40px] outline-white/70"></div>
                                <div className="w-2.5 h-6 left-[154.02px] top-[166.06px] absolute opacity-90 bg-slate-100 outline outline-[0.64px] outline-offset-[-0.32px] outline-white"></div>
                                <div className="w-[3.18px] h-44 left-[158.78px] top-[191.46px] absolute outline outline-[1.43px] outline-offset-[-0.71px] outline-white/75"></div>
                                <div className="w-[3.18px] h-44 left-[159.57px] top-[191.46px] absolute outline outline-[0.64px] outline-offset-[-0.32px] outline-black/20"></div>
                                <div className="w-56 h-52 left-[48.98px] top-[172.41px] absolute bg-gradient-to-b from-orange-100/30 via-amber-200/50 via 35% to-yellow-600/80"></div>
                                <div className="w-56 h-52 left-[48.98px] top-[172.41px] absolute opacity-80 bg-radial-[at_50%_60%] from-white/40 via-white/10 via 45% to-white/0"></div>
                                <div className="w-20 h-2.5 left-[117.50px] top-[167.65px] absolute bg-white/50"></div>
                                <div className="w-20 h-0.5 left-[117.50px] top-[172.41px] absolute opacity-80 outline outline-[1.19px] outline-offset-[-0.60px] outline-white"></div>
                                <div className="w-56 h-7 left-[47.09px] top-[358.18px] absolute bg-gradient-to-b from-white/60 via-slate-300/20 via 45% to-slate-400/40 outline outline-1 outline-offset-[-0.48px] outline-white/70"></div>
                                <div className="w-44 h-[4.76px] left-[67.48px] top-[380.41px] absolute opacity-90 outline outline-2 outline-offset-[-0.99px] outline-white"></div>
                                <div className="w-40 h-1 left-[77.80px] top-[383.59px] absolute outline outline-[0.79px] outline-offset-[-0.40px] outline-black/25"></div>
                                <div className="size-60 left-[39.91px] top-[160.90px] absolute bg-linear-43 from-white/30 via-white/10 via 20% to-white/40 outline outline-2 outline-offset-[-0.87px] outline-white/90"></div>
                                <div className="w-20 h-48 left-[44.46px] top-[166.06px] absolute opacity-90 outline outline-[3.18px] outline-offset-[-1.59px] outline-white"></div>
                                <div className="w-16 h-48 left-[52.40px] top-[167.65px] absolute opacity-40 outline outline-[1.19px] outline-offset-[-0.60px] outline-white"></div>
                                <div className="w-20 h-48 left-[200.06px] top-[166.06px] absolute opacity-75 outline outline-[2.38px] outline-offset-[-1.19px] outline-white"></div>
                                <div className="w-16 h-48 left-[196.09px] top-[167.65px] absolute opacity-30 outline outline-1 outline-offset-[-0.48px] outline-white"></div>
                                <div className="left-[137.35px] top-[271.65px] absolute text-center justify-start text-white text-[7.15px] font-normal font-['Inter']">
                                    CHEM BROS
                                </div>
                                <div className="left-[124.25px] top-[284.75px] absolute text-center justify-start text-white text-xs font-bold font-['Cinzel']">
                                    Molecule J
                                </div>
                                <div className="left-[129.37px] top-[304.99px] absolute text-center justify-start text-white/70 text-[5.56px] font-normal font-['Inter']">
                                    EXTRAIT DE PARFUM
                                </div>
                                <div className="left-[134.53px] top-[318.09px] absolute text-center justify-start text-white/50 text-[5.16px] font-normal font-['Inter']">
                                    MADURAI // 50 ML
                                </div>
                                <div className="w-16 h-52 left-[63.51px] top-[165.26px] absolute opacity-30"></div>
                            </div>
                        </div>

                        {/* Pedestal 3 */}
                        <div className="w-60 h-40 left-[692px] top-[483px] absolute bg-gradient-to-r from-slate-500 via-slate-300 via 18% to-slate-500 rounded-tl-[20px] rounded-tr-[20px] shadow-[0px_20px_40px_-14.999999046325684px_rgba(3,21,29,0.45)] shadow-[inset_0px_0.9999999403953552px_0px_0px_rgba(255,255,255,0.80)] border-l-1 border-r-1 border-gray-500 overflow-hidden">
                            <div className="w-9 h-40 left-[43.29px] top-0 absolute bg-white/25 blur-[0.50px]"></div>
                            <div className="w-12 h-40 left-[113.79px] top-0 absolute bg-white/30 blur-[1px]"></div>
                            <div className="w-7 h-40 left-[172.54px] top-0 absolute bg-black/20"></div>
                        </div>

                        {/* Bottle 3 */}
                        <div className="w-60 h-96 left-[688px] top-[87px] absolute overflow-hidden">
                            <div className="w-80 h-96 left-[-40px] top-[-28px] absolute overflow-hidden">
                                <div className="w-32 h-28 left-[92.09px] top-[48.56px] absolute"></div>
                                <div className="w-32 h-28 left-[92.09px] top-[48.56px] absolute bg-gradient-to-r from-zinc-950/90 via-gray-800/30 via 25% to-zinc-950/90"></div>
                                <div className="w-32 h-6 left-[92.09px] top-[35.86px] absolute bg-radial from-neutral-700 via-zinc-900 via 70% to-neutral-950 outline outline-[0.79px] outline-offset-[-0.40px] outline-zinc-800"></div>
                                <div className="w-24 h-4 left-[111.14px] top-[39.83px] absolute opacity-60 outline outline-[0.79px] outline-offset-[-0.40px] outline-gray-800"></div>
                                <div className="w-14 h-2.5 left-[130.99px] top-[43.80px] absolute opacity-70 outline outline-[0.64px] outline-offset-[-0.32px] outline-zinc-700"></div>
                                <div className="w-6 h-28 left-[100.03px] top-[51.74px] absolute outline outline-2 outline-offset-[-0.99px] outline-white/20"></div>
                                <div className="w-20 h-3 left-[117.50px] top-[157.32px] absolute bg-gradient-to-r from-gray-600 via-white via 25% to-gray-700 outline outline-[0.79px] outline-offset-[-0.40px] outline-white/70"></div>
                                <div className="w-2.5 h-6 left-[154.02px] top-[166.06px] absolute opacity-90 bg-slate-100 outline outline-[0.64px] outline-offset-[-0.32px] outline-white"></div>
                                <div className="w-[3.18px] h-44 left-[158.78px] top-[191.46px] absolute outline outline-[1.43px] outline-offset-[-0.71px] outline-white/75"></div>
                                <div className="w-[3.18px] h-44 left-[159.57px] top-[191.46px] absolute outline outline-[0.64px] outline-offset-[-0.32px] outline-black/20"></div>
                                <div className="w-56 h-52 left-[48.98px] top-[172.41px] absolute bg-gradient-to-b from-orange-100/30 via-amber-200/50 via 35% to-yellow-600/80"></div>
                                <div className="w-56 h-52 left-[48.98px] top-[172.41px] absolute opacity-80 bg-radial-[at_50%_60%] from-white/40 via-white/10 via 45% to-white/0"></div>
                                <div className="w-20 h-2.5 left-[117.50px] top-[167.65px] absolute bg-white/50"></div>
                                <div className="w-20 h-0.5 left-[117.50px] top-[172.41px] absolute opacity-80 outline outline-[1.19px] outline-offset-[-0.60px] outline-white"></div>
                                <div className="w-56 h-7 left-[47.09px] top-[358.18px] absolute bg-gradient-to-b from-white/60 via-slate-300/20 via 45% to-slate-400/40 outline outline-1 outline-offset-[-0.48px] outline-white/70"></div>
                                <div className="w-44 h-[4.76px] left-[67.48px] top-[380.41px] absolute opacity-90 outline outline-2 outline-offset-[-0.99px] outline-white"></div>
                                <div className="w-40 h-1 left-[77.80px] top-[383.59px] absolute outline outline-[0.79px] outline-offset-[-0.40px] outline-black/25"></div>
                                <div className="size-60 left-[39.91px] top-[160.90px] absolute bg-linear-43 from-white/30 via-white/10 via 20% to-white/40 outline outline-2 outline-offset-[-0.87px] outline-white/90"></div>
                                <div className="w-20 h-48 left-[44.46px] top-[166.06px] absolute opacity-90 outline outline-[3.18px] outline-offset-[-1.59px] outline-white"></div>
                                <div className="w-16 h-48 left-[52.40px] top-[167.65px] absolute opacity-40 outline outline-[1.19px] outline-offset-[-0.60px] outline-white"></div>
                                <div className="w-20 h-48 left-[200.06px] top-[166.06px] absolute opacity-75 outline outline-[2.38px] outline-offset-[-1.19px] outline-white"></div>
                                <div className="w-16 h-48 left-[196.09px] top-[167.65px] absolute opacity-30 outline outline-1 outline-offset-[-0.48px] outline-white"></div>
                                <div className="left-[137.35px] top-[271.65px] absolute text-center justify-start text-white text-[7.15px] font-normal font-['Inter']">
                                    CHEM BROS
                                </div>
                                <div className="left-[124.25px] top-[284.75px] absolute text-center justify-start text-white text-xs font-bold font-['Cinzel']">
                                    Molecule J
                                </div>
                                <div className="left-[129.37px] top-[304.99px] absolute text-center justify-start text-white/70 text-[5.56px] font-normal font-['Inter']">
                                    EXTRAIT DE PARFUM
                                </div>
                                <div className="left-[134.53px] top-[318.09px] absolute text-center justify-start text-white/50 text-[5.16px] font-normal font-['Inter']">
                                    MADURAI // 50 ML
                                </div>
                                <div className="w-16 h-52 left-[63.51px] top-[165.26px] absolute opacity-30"></div>
                            </div>
                        </div>

                        {/* Pedestal 4 */}
                        <div className="size-60 left-[1021px] top-[404px] absolute bg-gradient-to-r from-slate-500 via-slate-300 via 18% to-slate-500 rounded-tl-[20px] rounded-tr-[20px] shadow-[0px_20px_40px_-14.999999046325684px_rgba(3,21,29,0.45)] shadow-[inset_0px_0.9999999403953552px_0px_0px_rgba(255,255,255,0.80)] border-l-1 border-r-1 border-gray-500 overflow-hidden">
                            <div className="w-9 h-60 left-[43.29px] top-0 absolute bg-white/25 blur-[0.50px]"></div>
                            <div className="w-12 h-60 left-[113.79px] top-0 absolute bg-white/30 blur-[1px]"></div>
                            <div className="w-7 h-60 left-[172.54px] top-0 absolute bg-black/20"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}
