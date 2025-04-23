import React, { useEffect } from "react";
import LampDemo from "../components/LandingPageComponents/LampDemo";
import Aboutus from "../components/LandingPageComponents/Aboutus";
import timelineData from "../assets/MeetTheTeamData";
import HeroSection from "../components/LandingPageComponents/HeroSection";
import Joinus from "../components/LandingPageComponents/Joinus";
import { gsap } from "gsap";

const LandingPage = () => {

  useEffect(() => {
    window.onbeforeunload = () => {
      window.scrollTo(0, 0);
  };
document.body.style.overflow = "hidden";
    gsap.delayedCall(6.8, () => {
      document.body.style.overflow = "auto";
  });
 }, []);

  return (
    
    <div className="bg-[#0C0A09] w-full h-100vh text-[#A3A097]">
      <HeroSection/>
      <LampDemo/>
      <Aboutus data={timelineData}/>

      {/* <div className="opacity-[50%] h-20"></div> */}
      <div className="relative h-[60vh] sm:h-[400px] w-full overflow-hidden bg-rgb[12,10,9] flex items-center justify-center" style={{boxShadow:"0 0 20px rgba(68, 62, 52, 0.1), 0 0 40px rgba(89, 81, 69, 0.1), 0 0 60px rgba(89, 81, 69, 0.15)"}}>
      {/* Section with Spotlight */}
      <div className="relative h-[60vh] sm:h-[300px] w-[150%] sm:w-[800px] overflow-visible mx-auto">
        <Joinus
          width={250} // Adjusted for 500px width container
          height={400} // Adjusted for 300px height container
          smallWidth={120} // Adjusted for 500px width container
          translateY={-150} // Adjusted for 300px height container
          xOffset={50} // Adjusted for 500px width container
        />
        
      </div>
      </div>
    </div>
  );
};

export default LandingPage;
