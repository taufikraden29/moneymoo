import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  const handleCopyHistoryItem = (item) => {
    navigator.clipboard.writeText(`${item.expression} = ${item.result}`);
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
      className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-4 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">🧮 Kalkulator</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Display */}
        <div className="bg-gray-100 rounded-xl p-4 mb-4 text-right">
          <div className="text-gray-500 text-sm min-h-[20px] break-all">
            {input || '0'}
          </div>
          <div className="text-2xl font-bold text-gray-800 min-h-[30px] break-all">
            {result || '0'}
          </div>
        </div>

        {/* Calculator Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => handleButtonClick(btn)}
              className={`
                py-3 rounded-xl font-bold text-lg transition-colors
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
          <div className="mb-4">
            <button
              onClick={handleCopyResult}
              className="w-full py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              📋 Salin Hasil: {result}
            </button>
          </div>
        )}

        {/* History */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Riwayat</h3>
          <div className="max-h-40 overflow-y-auto space-y-2">
            <AnimatePresence>
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Belum ada riwayat perhitungan</p>
              ) : (
                history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-between items-center bg-gray-50 rounded-lg p-3 text-sm"
                  >
                    <div 
                      className="flex-1 cursor-pointer hover:bg-gray-100 p-1 rounded"
                      onClick={() => handleUseHistoryItem(item)}
                    >
                      <div className="font-medium">{item.expression}</div>
                      <div className="text-gray-500 text-xs">{item.timestamp}</div>
                    </div>
                    <div className="font-bold ml-2">= {item.result}</div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleCopyHistoryItem(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
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