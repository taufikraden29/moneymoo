import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Calculator = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading calculator history:', error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
  }, [history]);

  const handleButtonClick = (value) => {
    if (value === '=') {
      try {
        // Using Function constructor for safe evaluation
        const calculationResult = Function('"use strict"; return (' + input + ')')();
        const calculationString = `${input} = ${calculationResult}`;
        
        setResult(calculationResult.toString());
        
        // Add to history with timestamp
        const newHistoryItem = {
          id: Date.now(),
          expression: input,
          result: calculationResult,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Keep only last 10 items
      } catch (error) {
        setResult('Error');
      }
    } else if (value === 'C') {
      setInput('');
      setResult('');
    } else if (value === 'CE') {
      // Clear entry - remove last character
      setInput(prev => prev.slice(0, -1));
    } else if (value === '±') {
      // Toggle positive/negative
      if (input) {
        if (input.startsWith('-')) {
          setInput(prev => prev.substring(1));
        } else {
          setInput(prev => `-${prev}`);
        }
      }
    } else if (value === '√') {
      // Square root
      if (input) {
        try {
          const num = parseFloat(input);
          if (num >= 0) {
            const sqrtResult = Math.sqrt(num);
            setInput(sqrtResult.toString());
          }
        } catch (error) {
          setResult('Error');
        }
      }
    } else if (value === '^2') {
      // Square
      if (input) {
        try {
          const num = parseFloat(input);
          const squaredResult = Math.pow(num, 2);
          setInput(squaredResult.toString());
        } catch (error) {
          setResult('Error');
        }
      }
    } else {
      setInput(prev => prev + value);
    }
  };

  const handleCopyResult = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
        toast.success('Hasil disalin ke clipboard! 📋');
      } catch (err) {
        console.error('Failed to copy: ', err);
        toast.error('Gagal menyalin ke clipboard');
      }
    }
  };

  const handleCopyHistoryItem = async (item) => {
    try {
      await navigator.clipboard.writeText(`${item.expression} = ${item.result}`);
      toast.success('Riwayat disalin ke clipboard! 📋');
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Gagal menyalin ke clipboard');
    }
  };

  const handleUseHistoryItem = (item) => {
    setInput(item.expression);
    setResult(item.result.toString());
  };

  const buttons = [
    'C', 'CE', '√', '^2',
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '±', '+',
    '='
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-3 sm:p-4 w-full max-w-[95vw] sm:max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800">🧮 Kalkulator</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            &times;
          </button>
        </div>

        {/* Display */}
        <div className="bg-gray-100 rounded-xl p-5 mb-5 text-right">
          <div className="text-gray-500 text-sm min-h-[24px] break-all">
            {input || '0'}
          </div>
          <div className="text-3xl font-bold text-gray-900 min-h-[36px] break-all mt-1">
            {result || '0'}
          </div>
        </div>

        {/* Calculator Buttons */}
        <div className="grid grid-cols-4 gap-3 mb-5 sm:gap-4">
          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => handleButtonClick(btn)}
              className={`
                py-4 rounded-xl font-bold text-lg transition-colors min-h-[56px] flex items-center justify-center
                ${btn === '=' 
                  ? 'bg-blue-600 text-white col-span-4' 
                  : ['+', '-', '*', '/', '='].includes(btn)
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : ['C', 'CE'].includes(btn)
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {btn}
            </button>
          ))}
        </div>

        {/* Copy Result Button */}
        {result && (
          <div className="mb-5">
            <button
              onClick={handleCopyResult}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              📋 Salin Hasil: {result}
            </button>
          </div>
        )}

        {/* History */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-base">Riwayat</h3>
          <div className="max-h-48 overflow-y-auto space-y-3 sm:space-y-4">
            <AnimatePresence>
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm italic py-2">Belum ada riwayat perhitungan</p>
              ) : (
                history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-4 text-sm shadow-sm"
                  >
                    <div 
                      className="flex-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                      onClick={() => handleUseHistoryItem(item)}
                    >
                      <div className="font-medium text-gray-800">{item.expression}</div>
                      <div className="text-gray-500 text-xs mt-1">{item.timestamp}</div>
                    </div>
                    <div className="font-bold ml-2 text-gray-700 text-base">= {item.result}</div>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => handleCopyHistoryItem(item)}
                        className="text-blue-600 hover:text-blue-800 text-base"
                        title="Salin"
                      >
                        📋
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Calculator;