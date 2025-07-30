import { useEffect, useState } from "react";
import { Toast, ToastToggle } from "flowbite-react";
import { HiCheck, HiExclamation, HiX } from "react-icons/hi";

export default function Toaster({ type, message, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose && onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  let icon, iconClasses;

  switch (type) {
    case "success":
      icon = <HiCheck className="w-5 h-5" />;
      iconClasses =
        "text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200";
      break;
    case "error":
      icon = <HiX className="w-5 h-5" />;
      iconClasses =
        "text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200";
      break;
    case "warning":
      icon = <HiExclamation className="w-5 h-5" />;
      iconClasses =
        "text-orange-500 bg-orange-100 dark:bg-orange-700 dark:text-orange-200";
      break;
    default:
      icon = null;
      iconClasses = "";
  }

  if (!visible) return null;

  return (
    <div className="fixed z-50 transition-opacity duration-500 top-4 right-4">
      <Toast className="animate-fade-in">
        <div
          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${iconClasses}`}
        >
          {icon}
        </div>
        <div className="ml-3 text-sm font-normal">{message}</div>
        <ToastToggle onClick={() => {
          setVisible(false);
          onClose && onClose();
        }} />
      </Toast>
    </div>
  );
}
