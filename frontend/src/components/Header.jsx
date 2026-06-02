import headerLogo2 from '../assets/Header2VMILogo.avif';

const Header = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      {/* Logo */}
      <div className="flex-shrink-0">
        <img 
          src={headerLogo2} 
          alt="VMI Logo" 
          className="h-14 sm:h-20 w-auto object-contain"
        />
      </div>

      {/* Text */}
      <div className="flex flex-col text-center sm:text-left">
        <h1 className="text-lg sm:text-2xl font-bold text-red-700 leading-tight">
          Examination Wing
        </h1>
        <p className="text-[10px] sm:text-xs text-red-600">
          Varahamihira Multidiscipilinary Institute
        </p>
      </div>
    </div>
  );
};

export default Header;
