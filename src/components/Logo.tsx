
import { GiHeartOrgan } from "react-icons/gi";

const Logo = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <GiHeartOrgan className="w-12 h-12 text-red-600" />
      <span className="text-2xl font-bold text-red-600">বগুড়া অনলাইন রক্তদান সংগঠন</span>
    </div>
  );
};

export default Logo;
