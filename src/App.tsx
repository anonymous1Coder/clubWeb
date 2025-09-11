import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

// 导入构建时生成的benchmarks配置
import benchmarks from './benchmarks.json';
// 导入构建时生成的puzzles配置
import puzzleFiles from './puzzles.json';
// 导入构建时生成的show配置
import showFiles from './show.json';

const BENCHMARKS = benchmarks;
const SHOW_FILES = showFiles;



const BAR_CHART = {
  case: 'bar_chat_acc.png',
  cell: 'bar_chat_cell_acc.png',
};
const RADAR_CHART = {
  case: 'radar_chart_case_accuracy.png',
  cell: 'radar_chart_cell_accuracy.png',
};
const TABLE_CSV = {
  case: 'summary_case_accuracy.csv',
  cell: 'summary_cell_accuracy.csv',
};

function CSVTable({ src, searchTerm }: { src: string; searchTerm: string }) {
  const [rows, setRows] = useState<string[][]>([]);
  
  useEffect(() => {
    fetch(src)
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split(/\r?\n/);
        const data = lines.map(line => line.split(','));
        setRows(data);
      });
  }, [src]);
  
  if (!rows.length) return <div className="py-6 text-center">Loading...</div>;
  
  const isHighlighted = (row: string[], rowIndex: number) => {
    if (rowIndex === 0) return false; // Don't highlight header
    if (!searchTerm) return false;
    return row.some(cell => 
      cell.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs border">
        <thead>
          <tr>
            {rows[0]?.map((h, i) => (
              <th key={i} className="border px-2 py-1 bg-slate-50">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, i) => (
            <tr 
              key={i} 
              className={isHighlighted(row, i + 1) ? 'bg-yellow-100' : ''}
            >
              {row.map((cell, j) => (
                <td key={j} className="border px-2 py-1">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PuzzleExamples() {
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [selectedPuzzle, setSelectedPuzzle] = useState<string>('');
  const [puzzleData, setPuzzleData] = useState<any>(null);

  useEffect(() => {
    // 加载所有puzzle数据
    Promise.all(
      puzzleFiles.map(file => 
        fetch(`example/${file}`)
          .then(res => res.json())
          .catch(() => null)
      )
    ).then(results => {
      const validPuzzles = results.filter(p => p !== null);
      setPuzzles(validPuzzles);
      if (validPuzzles.length > 0) {
        setSelectedPuzzle(validPuzzles[0].puzzle_name);
        setPuzzleData(validPuzzles[0]);
      }
    });
  }, []);

  const handlePuzzleSelect = (puzzleName: string) => {
    setSelectedPuzzle(puzzleName);
    const puzzle = puzzles.find(p => p.puzzle_name === puzzleName);
    setPuzzleData(puzzle);
  };

  if (!puzzleData) return <div className="py-6 text-center">Loading puzzles...</div>;

  return (
    <div className="space-y-6">
      {/* Puzzle Selection */}
      <div className="flex flex-wrap gap-2">
        {puzzles.map(puzzle => (
          <button
            key={puzzle.puzzle_name}
            onClick={() => handlePuzzleSelect(puzzle.puzzle_name)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPuzzle === puzzle.puzzle_name
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {puzzle.puzzle_name.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Puzzle Content */}
      <div className="space-y-6">
        {/* Base Rule */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Base Rule</h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed">
            {puzzleData.base_rule.split('\n').map((line: string, index: number) => (
              <p key={index} className={line.trim() ? 'mb-2' : 'mb-4'}>
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Parameters */}
        {puzzleData.parameters && puzzleData.parameters.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {puzzleData.parameters.map((param: any, index: number) => (
                <div key={index} className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800">{param.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{param.description}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    Range: {param.min} - {param.max}
                    {param.step !== undefined && ` (step: ${param.step})`}
                  </div>
                  {param.variant && (
                    <p className="text-xs text-gray-600 mt-2 italic">{param.variant}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Examples */}
        {puzzleData.examples && puzzleData.examples.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Examples</h3>
            {puzzleData.examples.map((example: any, index: number) => (
              <div key={index} className="bg-green-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-green-800 mb-3">Example {index + 1}</h4>
                
                {/* Puzzle Description */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Puzzle:</h5>
                  <div className="bg-white rounded p-3 text-sm">
                    {example.puzzle.split('\n').map((line: string, lineIndex: number) => (
                      <p key={lineIndex} className={line.trim() ? 'mb-1' : 'mb-2'}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Question */}
                {example.question && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-2">Question:</h5>
                    <div className="bg-white rounded p-3">
                      {Array.isArray(example.question) ? (
                        <div>
                          {Array.isArray(example.question[0]) ? (
                            // 二维数组 - 渲染为表格
                            <div className="overflow-x-auto">
                              <table className="border-collapse border border-gray-300">
                                <tbody>
                                  {example.question.map((row: any[], rowIndex: number) => (
                                    <tr key={rowIndex}>
                                      {row.map((cell: any, cellIndex: number) => (
                                        <td key={cellIndex} className="border border-gray-300 px-3 py-2 text-center bg-gray-50">
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            // 一维数组 - 检查是否为坐标元组
                            <div>
                              {example.question.length === 2 && typeof example.question[0] === 'string' && example.question[0] === '_' ? (
                                // 坐标元组格式 - 渲染为括号
                                <span className="bg-gray-100 px-3 py-2 rounded font-mono">
                                  ({example.question.join(', ')})
                                </span>
                              ) : (
                                // 普通一维数组 - 渲染为表格行
                                <div className="overflow-x-auto">
                                  <table className="border-collapse border border-gray-300">
                                    <tbody>
                                      <tr>
                                        {example.question.map((item: any, itemIndex: number) => (
                                          <td key={itemIndex} className="border border-gray-300 px-3 py-2 text-center bg-gray-50">
                                            {item}
                                          </td>
                                        ))}
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : typeof example.question === 'object' ? (
                        <div className="space-y-3">
                          {Object.entries(example.question).map(([key, value]: [string, any]) => (
                            <div key={key} className="border-l-4 border-blue-200 pl-3">
                              <h6 className="font-semibold text-blue-800 mb-2">{key}:</h6>
                              {typeof value === 'object' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {Object.entries(value).map(([attrKey, attrValue]: [string, any]) => (
                                    <div key={attrKey} className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-600">{attrKey}:</span>
                                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">{attrValue}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="bg-gray-100 px-2 py-1 rounded">{value}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="bg-gray-100 px-2 py-1 rounded">{example.question}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Answer */}
                {example.answer && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Answer:</h5>
                    <div className="bg-white rounded p-3">
                      {Array.isArray(example.answer) ? (
                        <div>
                          {Array.isArray(example.answer[0]) ? (
                            // 二维数组 - 渲染为表格
                            <div className="overflow-x-auto">
                              <table className="border-collapse border border-gray-300">
                                <tbody>
                                  {example.answer.map((row: any[], rowIndex: number) => (
                                    <tr key={rowIndex}>
                                      {row.map((cell: any, cellIndex: number) => (
                                        <td key={cellIndex} className="border border-gray-300 px-3 py-2 text-center bg-green-50">
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            // 一维数组 - 检查是否为坐标元组
                            <div>
                              {example.answer.length === 2 && typeof example.answer[0] === 'number' ? (
                                // 坐标元组格式 - 渲染为括号
                                <span className="bg-green-100 px-3 py-2 rounded font-mono text-green-800">
                                  ({example.answer.join(', ')})
                                </span>
                              ) : (
                                // 普通一维数组 - 渲染为表格行
                                <div className="overflow-x-auto">
                                  <table className="border-collapse border border-gray-300">
                                    <tbody>
                                      <tr>
                                        {example.answer.map((item: any, itemIndex: number) => (
                                          <td key={itemIndex} className="border border-gray-300 px-3 py-2 text-center bg-green-50 text-green-800">
                                            {item}
                                          </td>
                                        ))}
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : typeof example.answer === 'object' ? (
                        <div className="space-y-3">
                          {Object.entries(example.answer).map(([key, value]: [string, any]) => (
                            <div key={key} className="border-l-4 border-green-200 pl-3">
                              <h6 className="font-semibold text-green-800 mb-2">{key}:</h6>
                              {typeof value === 'object' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {Object.entries(value).map(([attrKey, attrValue]: [string, any]) => (
                                    <div key={attrKey} className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-600">{attrKey}:</span>
                                      <span className="bg-green-100 px-2 py-1 rounded text-green-800 text-sm">{attrValue}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="bg-green-100 px-2 py-1 rounded text-green-800">{value}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="bg-green-100 px-2 py-1 rounded text-green-800">{example.answer}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 图片网格组件
function ImageGrid() {
  return (
    <div className="w-full">
      {/* 标题区域 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-2 text-gray-800">
          LogicEvolve
        </h1>
        <h2 className="text-xl md:text-2xl font-medium text-gray-600">
          Advancing Logical Reasoning Toward Self-Evolution
        </h2>
      </div>

      {/* 图片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {SHOW_FILES.map((file) => (
          <div key={file} className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <img
              src={`show/${file}`}
              alt={file.replace(/_/g, ' ').replace('.png', '')}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* 图片标题覆盖层 */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h3 className="text-white font-medium text-sm">
                {file.replace(/_/g, ' ').replace('.png', '')}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  // 选择的benchmark
  const [bench, setBench] = useState(BENCHMARKS[0]);
  // bar图 case/cell
  const [barType, setBarType] = useState<'case' | 'cell'>('case');
  // 表格 case/cell
  const [tableType, setTableType] = useState<'case' | 'cell'>('case');
  // 表格搜索词
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      {/* ───── NAVBAR ───── */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">
            CLUB&nbsp;<span className="text-indigo-600">Leaderboard</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => document.getElementById('benchmark-select')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm px-3 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Benchmark
              </button>
              <button 
                onClick={() => document.getElementById('summary')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm px-3 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Summary
              </button>
              <button 
                onClick={() => document.getElementById('bar-chart')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm px-3 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Bar Chart
              </button>
              <button 
                onClick={() => document.getElementById('radar-chart')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm px-3 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Radar Chart
              </button>
              <button 
                onClick={() => document.getElementById('accuracy-table')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm px-3 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Table
              </button>
              <button 
                onClick={() => document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm px-3 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Pipeline
              </button>
              <button 
                onClick={() => document.getElementById('example')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm px-3 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Example
              </button>
              <button 
                onClick={() => document.getElementById('references')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm px-3 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                References
              </button>
            </div>
            <a
              href="https://anonymous1coder.github.io/clubWeb/"
              target="_blank"
              rel="noreferrer"
              className="text-sm underline hover:text-indigo-600 transition-colors"
            >
              View&nbsp;Source
            </a>
          </div>
        </div>
      </nav>
      <div className="w-full px-4 py-10">
        <div className="w-full flex flex-col gap-10 px-4 py-8">
          {/* ── 图片网格 ── */}
          <Card className="w-full shadow-xl rounded-2xl">
            <CardContent className="p-8">
              <ImageGrid />
            </CardContent>
          </Card>

          {/* ── 选择benchmark ── */}
          <Card id="benchmark-select" className="w-full shadow-xl rounded-2xl">
            <CardHeader>
              <h2 className="text-xl font-semibold">Select Benchmark</h2>
            </CardHeader>
            <CardContent>
              <Select value={bench} onValueChange={setBench}>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="Select Benchmark" />
                </SelectTrigger>
                <SelectContent>
                  {BENCHMARKS.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* ── SUMMARY CARD ── */}
          <Card id="summary" className="w-full shadow-xl rounded-2xl">
            <CardHeader>
              <h2 className="text-xl font-semibold">Benchmark Summary</h2>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed">
              <p>CLUB (Complex Logical Unification Benchmark) evaluates multi‑step logical reasoning across diverse domains.</p>
              <ul className="list-disc ml-5">
                <li>10 task categories (Logic Puzzles, Logic Games…)</li>
                <li>1,000 problems, difficulty ranges from very easy to insanely hard</li>
                <li>Automatic checker + human spot‑check pipeline</li>
              </ul>
            {/* 新增显示acl_sunburst.png */}
            <div className="w-full flex justify-center mt-4">
              <img
                src="acl_sunburst.png"
                alt="ACL Sunburst"
                className="w-3/4 max-w-2xl"
                style={{ height: 'auto' }}
              />
            </div>
            </CardContent>
          </Card>

          {/* ── Bar图Tab ── */}
          <Card id="bar-chart" className="w-full shadow-xl rounded-2xl">
            <CardHeader className="flex flex-row items-end gap-4">
              <h2 className="text-xl font-semibold">Ranking Bar Chart</h2>
              <Select value={barType} onValueChange={v => setBarType(v as 'case' | 'cell')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="case">Example Level</SelectItem>
                  <SelectItem value="cell">Cell Level</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="w-full flex justify-center">
                <img
                  src={`data/${bench}/${BAR_CHART[barType]}`}
                  alt="Bar Chart"
                  className="w-4/5 max-w-4xl"
                  style={{ height: 'auto' }}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── 雷达图Tab ── */}
          <Card id="radar-chart" className="w-full shadow-xl rounded-2xl">
            <CardHeader>
              <h2 className="text-xl font-semibold">Radar Chart</h2>
            </CardHeader>
            <CardContent>
              <div className="w-full flex flex-col md:flex-row gap-6 justify-center items-center">
                <div className="w-full md:w-2/5">
                  <div className="text-center mb-2">Example Level</div>
                  <img
                    src={`data/${bench}/${RADAR_CHART.case}`}
                    alt="Radar Chart"
                    className="w-full"
                    style={{ height: 'auto' }}
                  />
                </div>
                <div className="w-full md:w-2/5">
                  <div className="text-center mb-2">Cell Level</div>
                  <img
                    src={`data/${bench}/${RADAR_CHART.cell}`}
                    alt="Radar Chart"
                    className="w-full"
                    style={{ height: 'auto' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── 表格Tab ── */}
          <Card id="accuracy-table" className="w-full shadow-xl rounded-2xl">
            <CardHeader className="flex flex-row items-end gap-4">
              <h2 className="text-xl font-semibold">Accuracy Table</h2>
              <Select value={tableType} onValueChange={v => setTableType(v as 'case' | 'cell')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="case">Example Level</SelectItem>
                  <SelectItem value="cell">Cell Level</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search in table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </CardHeader>
            <CardContent>
              <CSVTable src={`data/${bench}/${TABLE_CSV[tableType]}`} searchTerm={searchTerm} />
            </CardContent>
          </Card>

          {/* ── PIPELINE CARD ── */}
          <Card id="pipeline" className="w-full shadow-xl rounded-2xl">
            <CardHeader>
              <h2 className="text-xl font-semibold">Evaluation Pipeline</h2>
            </CardHeader>
            <CardContent className="text-sm flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-2/5 flex flex-col items-center">
                <img
                  src="flow.png"
                  alt="Flowchart"
                  className="w-full max-w-md"
                  style={{ height: 'auto' }}
                />
                <div className="text-xs text-gray-500 mt-2">Logic-Evolve Pipeline Diagram</div>
              </div>
              <div className="w-full md:w-3/5">
                <p>The overall Logic-Evolve pipeline consists of three main modules:</p>
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                  <li>Input Module: Structured metadata for logical reasoning tasks</li>
                  <li>Core Module: Multi-agent collaborative generation, where multiple autonomous agents jointly generate and parse tasks</li>
                  <li>Output Module: Large-scale logical reasoning datasets for training and evaluation, as well as the final CLUB leaderboard</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* ── EXAMPLE CARD ── */}
          <Card id="example" className="w-full shadow-xl rounded-2xl">
            <CardHeader>
              <h2 className="text-xl font-semibold">Sample Puzzles</h2>
            </CardHeader>
            <CardContent>
              <PuzzleExamples />
            </CardContent>
          </Card>

          {/* ── REFERENCES CARD ── */}
          <Card id="references" className="w-full shadow-xl rounded-2xl">
            <CardHeader>
              <h2 className="text-xl font-semibold">Key References</h2>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="list-disc ml-5 space-y-1">
                <li>Club: Complex Logical Unification Benchmark</li>
                <li>Logic-Evolve: A Multi-Agent Collaborative Generation Framework for Logical Reasoning</li>
              </ul>
            </CardContent>
          </Card>
          
        {/* 备案信息 */}
        <div className="w-full flex justify-center mt-8">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <img
              src="FilingIcon.png"
              alt="备案图标"
              className="w-4 h-4"
              style={{ display: 'inline-block', verticalAlign: 'middle' }}
            />
            <a
              href="https://beian.mps.gov.cn/#/query/webSearch?code=11010802046278"
              rel="noreferrer"
              target="_blank"
              className="hover:text-indigo-600"
            >
              京公网安备11010802046278号
            </a>
            <span>京ICP备2025129385号</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}