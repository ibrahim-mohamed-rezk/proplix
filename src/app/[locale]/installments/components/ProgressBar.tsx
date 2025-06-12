const ProgressBar = () => {
  return (
    <div className="w-full flex flex-col justify-start items-center">
      <div className="w-full flex justify-between items-center gap-4">
        <span className="text-[#7A7A7A] text-xl md:text-3xl font-normal font-['Gordita'] leading-loose">
          Payment Progress
        </span>
        <span className="text-[#FF6625] text-2xl md:text-4xl font-bold font-['Gordita'] leading-[48px]">
          45%
        </span>
      </div>
      <div className="w-full h-[12px] relative bg-[#FFD4C299] rounded-[132px]">
        <div
          className={`w-[45%] h-[12px] left-0 top-0 absolute bg-[#FF6625] rounded-full`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
