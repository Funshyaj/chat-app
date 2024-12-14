"use client";
interface Props {
  label: string;
  type?: "submit" | "reset" | "button";
  formId?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}
const PrimaryButton = ({
  label,
  type = "submit",
  formId,
  disabled,
  loading,
  onClick,
}: Props) => {
  return (
    <button
      form={formId}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`enabled:bg-darkBlue disabled:bg-gray-400 ${
        loading && "disabled:cursor-wait"
      } ${
        disabled && "disabled:cursor-not-allowed"
      }   capitalize text-white text-center w-full py-3 rounded-lg enabled:hover:shadow-lg enabled:active:scale-95 duration-300`}
    >
      {label}
    </button>
  );
};

export default PrimaryButton;
