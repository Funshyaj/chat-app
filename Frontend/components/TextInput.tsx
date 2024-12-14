import { ChangeEvent } from "react";

interface Props {
  name: string;
  type?: string;
  placeholder: string;
  value: string | number | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}
const TextInput = ({
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
}: Props) => {
  return (
    <input
      className="w-full rounded-md focus:outline-darkBlue focus:border-3 border border-gray-200 bg-gray-50 p-3 disabled:cursor-not-allowed duration-300"
      name={name}
      id={name}
      type={type}
      required
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

export default TextInput;
