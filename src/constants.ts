export const AGENTS = [
  {id:'quantum-core', name:'QUANTUM-CORE', type:'ORCHESTRATOR', short:'QC', color:'var(--gold)', avClass:'av-gold', task:'Monitoring qubit coherence'},
  {id:'upgrade-core', name:'UPGRADE-CORE', type:'EVOLUTION', short:'UC', color:'#ffb84d', avClass:'av-gold', task:'Ready for manual upgrade proposals'},
  {id:'analysis',    name:'ANALYSIS',     type:'REASONING',    short:'AN', color:'var(--a2)',   avClass:'av-purple', task:'Awaiting data stream'},
  {id:'synthesis',   name:'SYNTHESIS',    type:'GENERATION',   short:'SY', color:'var(--a3)',   avClass:'av-green', task:'Ready for synthesis'},
  {id:'claw-alpha',  name:'CLAW-α',       type:'CLAW',         short:'Cα', color:'#ff4444',    avClass:'av-red', task:'Idle · awaiting target'},
  {id:'claw-beta',   name:'CLAW-β',       type:'CLAW',         short:'Cβ', color:'#ff8844',    avClass:'av-orange', task:'Error-correction standby'},
  {id:'swarm-01',    name:'SWARM-01',     type:'SWARM',        short:'S1', color:'#00aaff',    avClass:'av-blue', task:'Sync · listening'},
  {id:'swarm-02',    name:'SWARM-02',     type:'SWARM',        short:'S2', color:'#00ddcc',    avClass:'av-teal', task:'Sync · listening'},
  {id:'neural-agt',  name:'NEURAL-AGT',   type:'NEURAL',       short:'NA', color:'#ff44aa',    avClass:'av-pink', task:'Neural layers warm'},
  {id:'rag-agent',   name:'RAG-AGENT',    type:'RAG',          short:'RA', color:'#aaaaff',    avClass:'av-blue', task:'Index loaded · ready'},
];

export const OR_FREE_MODELS = [
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-2-9b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'qwen/qwen-2-7b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',
  'deepseek/deepseek-chat:free',
  'deepseek/deepseek-r1:free',
  'google/gemma-2-27b-it:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
];

export const QSTATES=['|0⟩','|1⟩','|+⟩','|−⟩','|i⟩','|Ψ⟩','|Φ⟩'];

export const CIRCUITS: Record<string, string> = {
  superposition:`q0: ─H─────M\nq1: ─H─────M\n   ↑Hadamard\n   |+⟩ state`,
  entanglement:`q0: ─H─●───M\nq1: ───X───M\n   Bell Pair Φ+`,
  grover:`q0:─H─●─H─M\nq1:─H─X─H─M\nq2:─X─●─X─M\n   Oracle+Diff`,
  molecule:`q0:─Ry─●──M\nq1:─Ry─X──M\nq2:─Rz─●──M\n   VQE ansatz`,
  teleportation:`q0:─H─●──────M\nq1:───X─●──M─X\nq2:─────X──Z─M\n   Teleport`,
  optimization:`q0:─H─Rz─●─M\nq1:─H─Rz─X─M\nq2:─H─Rz─●─M\n   QAOA p=1`,
  error:`q0:─●─────M\nq1:─X─●───M\nq2:───X─●─M\n   Surface QEC`,
  shor:`q0:─H──QFT─M\nq1:─H──Ua──M\nq2:─H──QFT─M\n   Shor period`,
  vqe:`q0:─Ry─Rz─●─M\nq1:─Rx─Ry─X─M\nq2:─Rz─Rx─●─M\n   VQE deep`,
  custom:`q0:─?──────M\nq1:─?──────M\n   User defined`
};

export const RSS_FEEDS = [
  {url:'https://feeds.bbci.co.uk/news/world/rss.xml',      src:'BBC NEWS',   cat:'WORLD', cls:'cat-world'},
  {url:'https://feeds.bbci.co.uk/sport/rss.xml',           src:'BBC SPORT',  cat:'SPORT', cls:'cat-sport'},
  {url:'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', src:'BBC SCI', cat:'SCIENCE', cls:'cat-sci'},
  {url:'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', src:'NY TIMES', cat:'WORLD', cls:'cat-world'},
  {url:'https://www.theguardian.com/world/rss',             src:'GUARDIAN',   cat:'WORLD', cls:'cat-world'},
  {url:'https://www.theguardian.com/sport/rss',             src:'GUARDIAN',   cat:'SPORT', cls:'cat-sport'},
  {url:'https://feeds.skynews.com/feeds/rss/world.xml',     src:'SKY NEWS',   cat:'WORLD', cls:'cat-world'},
  {url:'https://www.aljazeera.com/xml/rss/all.xml',         src:'AL JAZEERA', cat:'GEO',   cls:'cat-geo'},
  {url:'https://feeds.feedburner.com/TechCrunch',           src:'TECHCRUNCH', cat:'TECH',  cls:'cat-sci'},
  {url:'https://www.sciencedaily.com/rss/all.xml',          src:'SCI DAILY',  cat:'SCIENCE',cls:'cat-sci'},
  {url:'https://www.nasa.gov/rss/dyn/breaking_news.rss',    src:'NASA',       cat:'SPACE', cls:'cat-sci'},
  {url:'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', src:'BBC ENT', cat:'ENT', cls:'cat-ent'},
  {url:'https://feeds.bbci.co.uk/news/health/rss.xml',      src:'BBC HEALTH', cat:'HEALTH',cls:'cat-health'},
  {url:'https://feeds.bbci.co.uk/news/business/rss.xml',    src:'BBC BIZ',    cat:'FINANCE',cls:'cat-fin'},
  {url:'https://rss.politico.com/politics-news.xml',        src:'POLITICO',   cat:'POLITICS',cls:'cat-pol'},
];

export const FALLBACK_NEWS = [
  {src:'REUTERS',cat:'WORLD',cls:'cat-world',text:'World leaders gather for emergency climate summit amid record temperatures'},
  {src:'AP',cat:'POLITICS',cls:'cat-pol',text:'Landmark trade agreement signed between major Pacific economies'},
  {src:'ESPN',cat:'SPORT',cls:'cat-sport',text:'World Cup qualifiers produce stunning upsets across all continents'},
  {src:'SCIENCE',cat:'SCIENCE',cls:'cat-sci',text:'Researchers announce breakthrough in room-temperature superconductivity'},
  {src:'BBC',cat:'HEALTH',cls:'cat-health',text:'WHO reports significant progress in eliminating malaria in sub-Saharan Africa'},
  {src:'BLOOMBERG',cat:'FINANCE',cls:'cat-fin',text:'Global markets react to central bank interest rate decisions'},
  {src:'AL JAZEERA',cat:'GEO',cls:'cat-geo',text:'Diplomatic talks resume in key conflict zones across Middle East'},
  {src:'NASA',cat:'SPACE',cls:'cat-sci',text:'Mars mission returns unprecedented data on planet interior composition'},
];
