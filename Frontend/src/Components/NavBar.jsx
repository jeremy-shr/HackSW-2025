import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaAdjust, FaMapMarkerAlt, FaSearch, FaLayerGroup } from "react-icons/fa";

const icons = [
  { id: "marker", icon: <FaMapMarkerAlt size={22} />, label: "Marker" },
  { id: "search", icon: <FaSearch size={22} />, label: "Search" },
  { id: "layers", icon: <FaLayerGroup size={22} />, label: "Layers" },
];

const navVariants = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 15 } },
};

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(icons[0].id); // Default to first icon

  return (
    <motion.div
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="fixed bottom-5 right-5 flex flex-col items-center gap-2 z-50 pointer-events-auto"
    >
      {/* Expandable Icons - Slide Out From Main Button */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="flex flex-col-reverse items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {icons.map(({ id, icon }, index) => (
              <motion.button
                key={id}
                onClick={() => {
                  setSelectedIcon(id);
                  setIsOpen(false); // Close after selection
                }}
                className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition pointer-events-auto ${
                  selectedIcon === id ? "bg-blue-500 text-white" : "bg-gray-700 text-white hover:bg-gray-800"
                }`}
                initial={{ y: 0, opacity: 0, scale: 0.9 }}
                animate={{ y: -(index + 1) * 48, opacity: 1, scale: 1 }}
                exit={{ y: 0, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {icon}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button (Shows Selected Icon) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition pointer-events-auto"
        whileTap={{ scale: 0.95 }}
      >
        {icons.find((i) => i.id === selectedIcon)?.icon || <FaAdjust size={24} />}
      </motion.button>
    </motion.div>
  );
}

export default NavBar;
