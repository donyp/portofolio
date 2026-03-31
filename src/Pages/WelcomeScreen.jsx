import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

const TypewriterEffect = ({ text }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 260);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className="inline-block">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const BackgroundEffect = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 blur-3xl animate-pulse" />
    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 via-transparent to-purple-600/10 blur-2xl animate-float" />
  </div>
);

const IconButton = ({ Icon }) => (
  <div className="relative group hover:scale-110 transition-transform duration-300">
    <div className="absolute -inset-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-300" />
    <div className="relative p-2 sm:p-3 bg-black/50 backdrop-blur-sm rounded-full border border-white/10">
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
    </div>
  </div>
);

const IconA = ({ className }) => (
  <svg className={className} viewBox="0 0 512.002 512.002" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path style={{ fill: "none" }} d="M386.015,485.696L268.349,26.651c-0.687-2.679-2.738-4.508-5.058-4.508H150.503 c-2.329,0-4.384,1.839-5.063,4.532L29.27,486.472c-0.487,1.943-0.19,4.051,0.807,5.683c0.999,1.632,2.576,2.595,4.254,2.595h89.103 c2.377,0,4.467-1.918,5.103-4.693l25.987-113.326h100.879l28.193,113.459c0.673,2.709,2.734,4.56,5.072,4.56h92.482 c0.017,0,0.035,0,0.043,0c2.924,0,5.295-2.867,5.295-6.404C386.488,487.399,386.322,486.502,386.015,485.696z M169.889,286.149 l20.676-89.411c3.754-16.112,7.304-35.175,10.736-53.614c0.785-4.235,1.558-8.39,2.326-12.452 c4.542,22.088,9.539,45.95,14.547,66.132l21.689,89.344h-69.974V286.149z"></path>
    <path style={{ fill: "#ffffff" }} d="M220.525,127.196c-1.651-8.026-8.716-13.777-16.896-13.777c-0.047,0-0.097,0-0.143,0 c-8.24,0.067-15.283,5.954-16.812,14.053c-0.768,4.08-1.546,8.253-2.362,12.658c-3.388,18.192-6.892,37.004-10.555,52.72 l-20.676,89.411c-1.185,5.124,0.033,10.508,3.305,14.624s8.245,6.514,13.503,6.514h69.975c5.291,0,10.291-2.429,13.562-6.589 c3.271-4.161,4.451-9.592,3.202-14.733l-21.71-89.43C229.898,172.424,224.857,148.259,220.525,127.196z M191.585,268.897 l12.849-55.56l13.488,55.56H191.585z"></path>
    <path style={{ fill: "#ffffff" }} d="M477.663,148.577h-85.718c-12.432,0-22.545,10.612-22.545,23.656v179.161l-84.339-329.03 c-2.64-10.287-11.59-17.474-21.77-17.474H150.503c-10.223,0-19.182,7.223-21.789,17.557L12.538,482.277 c-1.611,6.425-0.583,13.303,2.834,18.896C19.53,507.953,26.619,512,34.334,512h89.103c10.455,0,19.465-7.432,21.919-18.089 l22.914-99.928h73.645l24.939,100.363c2.579,10.394,11.55,17.656,21.815,17.656h188.995c12.432,0,22.546-10.612,22.546-23.656 V172.233C500.209,159.188,490.094,148.577,477.663,148.577z M298.219,477.496L272.148,372.57 c-1.911-7.691-8.817-13.091-16.743-13.091h-100.88c-8.043,0-15.018,5.557-16.815,13.396L113.72,477.498H49.334L160.021,39.393 h93.786l112.298,438.103H298.219z M465.705,477.496h-61.801V183.081h61.801V477.496z"></path>
    <path style={{ fill: "#ffffff" }} d="M434.043,122.661c-17.964,0-34.271-6.568-45.916-18.494c-11.033-11.297-16.957-26.409-16.705-42.588 c-0.245-16.557,5.674-31.863,16.691-43.131C399.734,6.552,416.23,0,434.555,0c36.069,0,62.83,25.692,63.634,61.087 c0.217,9.525-7.33,17.423-16.857,17.64c-9.563,0.205-17.424-7.332-17.638-16.857c-0.376-16.624-11.814-27.367-29.138-27.367 c-8.957,0-16.688,2.862-21.767,8.06c-4.573,4.679-7.009,11.31-6.863,18.675c0.005,0.238,0.005,0.476,0,0.714 c-0.148,6.977,2.296,13.406,6.887,18.108c5.098,5.222,12.637,8.096,21.23,8.096c9.526,0,17.252,7.724,17.252,17.252 S443.569,122.661,434.043,122.661z"></path>
  </svg>
);

const IconN = ({ className }) => (
  <svg className={className} viewBox="0 0 512.002 512.002" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon style={{ fill: "none" }} points="169.095,19.615 16.293,432.497 16.293,492.386 293.854,492.386 254.955,393.467 175.953,393.467 254.143,191.682 382.811,492.386 495.707,492.386 495.707,434.652 335.705,19.615 "></polygon>
    <path style={{ fill: "#ffffff" }} d="M495.707,508.679H382.809c-8.999,0-16.293-7.294-16.293-16.293s7.294-16.293,16.293-16.293h112.898 c8.999,0,16.293,7.294,16.293,16.293S504.706,508.679,495.707,508.679z"></path>
    <path style={{ fill: "#ffffff" }} d="M495.707,220.117c8.999,0,16.293-7.294,16.293-16.293V19.615c0-8.999-7.294-16.293-16.293-16.293 H16.293C7.294,3.322,0,10.617,0,19.615v412.88v59.892c0,8.999,7.294,16.293,16.293,16.293h271.253h6.307c0.011,0,0.023,0,0.033,0 c8.999,0,16.293-7.294,16.293-16.293c0-2.478-0.554-4.829-1.545-6.933l-38.518-97.949c-2.45-6.232-8.466-10.33-15.162-10.33 h-55.214l55.15-142.326l112.942,263.947c2.566,5.996,8.458,9.883,14.98,9.883h112.898c8.999,0,16.293-7.294,16.293-16.293v-57.734 c0-2.004-0.37-3.99-1.09-5.861L359.447,35.908h119.967v167.916C479.414,212.823,486.708,220.117,495.707,220.117z M145.692,35.908 L32.586,341.529V35.908H145.692z M479.414,437.684v38.409h-85.853L269.123,185.273c-2.607-6.089-8.604-10.02-15.262-9.88 c-6.621,0.114-12.516,4.228-14.91,10.403L160.76,387.58c-1.942,5.012-1.287,10.659,1.75,15.094 c3.037,4.435,8.067,7.086,13.442,7.086h67.901l26.085,66.334H32.586v-40.68L180.439,35.908h144.086L479.414,437.684z"></path>
  </svg>
);

const IconK = ({ className }) => (
  <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path style={{ fill: "none" }} d="M251.204,60.939c-28.328-23.617-67.491-35.196-126.978-35.196c-58.774,0-78.262,3.999-107.868,9.133 v451.381h85.818V311.172c8.859,1.307,7.611,1.767,20.115,1.767c56.888,0,102.521-14.262,135.168-46.087 c25.518-24.756,39.347-61.321,39.347-104.271C296.808,119.577,278.651,83.012,251.204,60.939z M121.683,236.735 c-13.837,0-11.091-0.626-19.333-2.455V104.632c6.753-1.994,7.44-3.991,26.866-3.991c48.192,0,72.077,24.015,72.298,64.342 C201.514,210.043,172.873,236.735,121.683,236.735z"></path>
    <path style={{ fill: "#ffffff" }} d="M495.642,366.776c-9.033,0-16.358,7.323-16.358,16.358c0,54.329-41.065,86.765-109.844,86.765 c-28.656,0-46.571-5.288-64.311-14.642l5.189-36.368c15.466,7.26,36.712,14.648,59.124,14.648c51.051,0,55.02-32.99,55.02-43.101 c0-29.724-23.146-40.652-53.462-51.871c-33.303-12.195-72.848-36.005-72.112-80.188c0.002-0.09,0.002-0.182,0.002-0.273 c0-52.584,41.021-87.915,102.073-87.915c21.394,0,40.273,3.564,57.341,10.863l-8.226,35.081 c-12.113-5.428-27.648-10.273-46.039-10.273c-37.455,0-50.744,22.857-50.744,42.429c0,27.491,23.72,38.815,57.231,51.817 c0.062,0.025,0.124,0.047,0.188,0.072c12.645,4.727,23.554,10.067,32.423,15.869c7.564,4.948,17.699,2.827,22.646-4.731 c4.945-7.561,2.828-17.698-4.732-22.644c-11.02-7.211-23.707-13.459-38.783-19.101c-11.63-4.513-25.819-10.353-32.624-15.56 c-3.635-2.781-3.635-3.887-3.635-5.72c0-2.403,0-9.713,18.028-9.713c19.961,0,35.056,7.924,48.805,16.039 c4.482,2.647,9.955,3,14.74,0.955c4.786-2.043,8.313-6.242,9.502-11.308l16.05-68.441c1.675-7.15-1.616-14.539-8.053-18.074 c-24.844-13.642-52.361-20.276-84.118-20.276c-34.198,0-64.29,9.121-87.824,26.487c0.003-0.463,0.029-0.918,0.029-1.384 c0-46.213-18.807-87.863-51.599-114.297C229.67,21.744,186.023,9.384,124.228,9.384c-56.953,0-78.54,3.767-105.871,8.539 l-4.793,0.834C5.725,20.118,0,26.921,0,34.876v451.381c0,9.034,7.325,16.358,16.358,16.358h85.82 c9.033,0,16.358-7.323,16.358-16.358v-156.98c1.127,0.011,2.372,0.018,3.757,0.018c62.307,0,111.374-16.845,145.845-50.029 c5.841,28.876,26.881,66.318,91.558,90.001c32.048,11.859,32.048,16.175,32.048,21.17c0,3.371,0,10.386-22.304,10.386 c-22.458,0-47.968-11.519-62.989-21.383c-4.678-3.07-10.603-3.541-15.71-1.235c-5.102,2.303-8.673,7.055-9.463,12.599 l-10.116,70.895c-0.931,6.53,2.148,12.98,7.813,16.358c24.71,14.742,49.551,24.56,90.464,24.56 c43.628,0,79.944-11.5,105.025-33.257C499.02,448.058,512,418.243,512,383.134C512,374.099,504.675,366.776,495.642,366.776z M122.293,296.58c-8.127,0-9.033-0.155-12.409-0.734c-1.386-0.237-3.041-0.52-5.32-0.855c-4.7-0.694-9.476,0.695-13.076,3.802 c-3.599,3.106-5.668,7.628-5.668,12.381v158.728H32.716V48.641c22.79-3.874,43.423-6.54,91.511-6.54 c54.521,0,90.452,9.684,116.504,31.402c0.074,0.062,0.149,0.123,0.224,0.182c25.101,20.187,39.498,52.587,39.498,88.893 c0,38.163-12.209,71.024-34.409,92.557C217.433,283.024,176.956,296.58,122.293,296.58z"></path>
    <path style={{ fill: "#ffffff" }} d="M194.419,105.643c-15.43-14.174-37.368-21.36-65.206-21.36c-17.115,0-22.548,1.495-28.883,3.777 c-0.79,0.285-1.611,0.587-2.616,0.883c-6.952,2.053-11.725,8.439-11.725,15.689v129.647c0,7.669,5.328,14.308,12.815,15.97 c1.718,0.381,2.789,0.684,3.826,0.978c5.27,1.492,8.063,1.866,19.05,1.866c29.123,0,53.364-8.03,70.105-23.223 c17.064-15.486,26.083-37.924,26.083-64.977C217.734,140.099,209.626,119.611,194.419,105.643z M121.683,220.377 c-1.135,0-2.12-0.003-2.975-0.01V117.314c2.411-0.201,5.715-0.316,10.508-0.316c37.466,0,55.764,15.725,55.94,47.984 C185.154,210.766,150.638,220.377,121.683,220.377z"></path>
  </svg>
);

const IconA2 = ({ className }) => (
  <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path style={{ fill: "#ffffff" }} d="M410.842,488.234h-87.74c-9.287,0-16.815-7.528-16.815-16.815V182.059 c0-9.287,7.528-16.815,16.815-16.815h73.205c8.35,0,15.34,6.104,16.61,14.188c17.161-12.966,37.82-20.459,58.687-20.459 c8.412,0,13.97,0,22.209,1.508C504.336,162.384,512,171.553,512,182.277v81.489c0,6.58-2.897,12.778-7.948,17.005 c-5.066,4.232-11.685,5.984-18.172,4.807c-6.343-1.157-12.06-1.925-19.408-1.925c-9.287,0-16.815-7.528-16.815-16.815 c0-9.287,7.528-16.815,16.815-16.815c4.331,0,8.281,0.212,11.898,0.548v-57.929c-1.887-0.042-4.046-0.042-6.766-0.042 c-17.516,0-43.332,9.595-58.445,36.633c-3.649,6.531-11.178,9.862-18.461,8.18c-7.288-1.683-12.588-7.979-13.005-15.448 l-1.288-23.095h-40.487v255.733h54.11V324.747c0-9.287,7.528-16.815,16.815-16.815s16.815,7.528,16.815,16.815v146.672 C427.657,480.706,420.129,488.234,410.842,488.234z"></path>
    <polygon style={{ fill: "none" }} points="268.448,471.419 268.448,380.135 123.641,380.135 123.641,40.581 16.815,40.581 16.815,471.419 "></polygon>
    <path style={{ fill: "#ffffff" }} d="M268.448,488.234H16.815C7.528,488.234,0,480.706,0,471.419V40.581 c0-9.287,7.528-16.815,16.815-16.815h106.826c9.287,0,16.815,7.528,16.815,16.815v322.74h127.992 c9.287,0,16.815,7.528,16.815,16.815v91.284C285.263,480.706,277.735,488.234,268.448,488.234z M33.63,454.604h218.004V396.95 H123.641c-9.287,0-16.815-7.528-16.815-16.815V57.396H33.63V454.604z"></path>
  </svg>
);

const WelcomeScreen = ({ onLoadingComplete }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: false,
    });

    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        onLoadingComplete?.();
      }, 1000);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  const containerVariants = {
    exit: {
      opacity: 0,
      scale: 1.1,
      filter: "blur(10px)",
      transition: {
        duration: 0.8,
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const childVariants = {
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-[#030014]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit="exit"
          variants={containerVariants}
        >
          <BackgroundEffect />

          <div className="relative min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-4xl mx-auto">
              {/* Icons */}
              <motion.div
                className="flex justify-center gap-3 sm:gap-4 md:gap-8 mb-6 sm:mb-8 md:mb-12"
                variants={childVariants}
              >
                {[IconA, IconN, IconK, IconA2].map((Icon, index) => (
                  <div key={index} data-aos="fade-down" data-aos-delay={index * 200}>
                    <IconButton Icon={Icon} />
                  </div>
                ))}
              </motion.div>

              {/* Welcome Text */}
              <motion.div
                className="text-center mb-6 sm:mb-8 md:mb-12"
                variants={childVariants}
              >
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold space-y-2 sm:space-y-4">
                  <div className="mb-2 sm:mb-4">
                    <span data-aos="fade-right" data-aos-delay="200" className="inline-block px-2 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                      Welcome
                    </span>{' '}
                    <span data-aos="fade-right" data-aos-delay="400" className="inline-block px-2 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                      To
                    </span>{' '}
                    <span data-aos="fade-right" data-aos-delay="600" className="inline-block px-2 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                      My
                    </span>
                  </div>
                  <div>
                    <span data-aos="fade-up" data-aos-delay="800" className="inline-block px-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Creative
                    </span>{' '}
                    <span data-aos="fade-up" data-aos-delay="1000" className="inline-block px-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Studio
                    </span>
                  </div>
                </h1>
              </motion.div>

              {/* Website Link */}
              <motion.div
                className="text-center"
                variants={childVariants}
                data-aos="fade-up"
                data-aos-delay="1200"
              >
                <a
                  href="https://www.eki.my.id"
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full relative group hover:scale-105 transition-transform duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
                  <div className="relative flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      <TypewriterEffect text="Doni Sugiharto" />
                    </span>
                  </div>
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;