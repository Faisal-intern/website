import headerLogo2 from '../assets/Header2VMILogo.avif';


const Header = () => {
  return (
    <div className="bg-white p-2 shadow-xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:justify-between">
          {/* First Logo */}
          <div className="flex-shrink-0">
            <img src={headerLogo2} alt="Logo 2" className="w-auto h-28 object-contain" />
          </div>

          {/* Center Text */}
          <div className="flex-grow mx-2 lg:mx-8 text-center lg:text-left">
            <div className="space-y-2">
              <p className="text-2xl md:text-4xl font-arya leading-tight text-red-600 font-bold">
                Varahamihira Multidiscipilinary Institute
              </p>
              <p className="text-lg font-arya md:text-3xl leading-snug text-red-600">
                Examination Result
              </p>
            </div>
          </div>

          {/* Remaining Logos - Hidden on mobile, visible on lg screens */}
          <div className="hidden lg:flex flex-wrap justify-center gap-4">
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
