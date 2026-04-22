import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function LinkedInGuide() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e8e8f0] font-sans selection:bg-[#5b6af0]/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        :root {
          --bg: #0a0a0f;
          --surface: #111118;
          --card: #16161f;
          --border: #252535;
          --accent: #5b6af0;
          --accent2: #00d4aa;
          --accent3: #f06060;
          --go: #00acd7;
          --kotlin: #a97bff;
          --java: #f89820;
          --ai: #00d4aa;
          --text: #e8e8f0;
          --muted: #7070a0;
          --tag-bg: #1e1e30;
        }

        .guide-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px 80px;
          font-family: 'DM Sans', sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 60px;
          position: relative;
        }

        .header::before {
          content: '';
          position: absolute;
          top: -40px; left: 50%; transform: translateX(-50%);
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, transparent, var(--accent));
        }

        .badge {
          display: inline-block;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--accent2);
          border: 1px solid var(--accent2);
          padding: 5px 16px;
          border-radius: 2px;
          margin-bottom: 20px;
        }

        h1 {
          font-size: clamp(32px, 6vw, 56px);
          font-weight: 600;
          line-height: 1.1;
          letter-spacing: -1px;
          margin-bottom: 12px;
        }

        h1 span {
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          color: var(--muted);
          font-size: 16px;
          font-weight: 300;
        }

        .legend {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 50px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--muted);
        }

        .dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .week {
          margin-bottom: 50px;
        }

        .week-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .week-num {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: var(--accent);
          letter-spacing: 2px;
          white-space: nowrap;
        }

        .week-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--text);
        }

        .week-line {
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .cards {
          display: grid;
          gap: 12px;
        }

        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px 24px;
          display: grid;
          grid-template-columns: 44px 1fr auto;
          align-items: start;
          gap: 16px;
          transition: border-color 0.2s, transform 0.2s;
          position: relative;
          overflow: hidden;
          text-align: left;
        }

        .card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
        }

        .card.go::before { background: var(--go); }
        .card.kotlin::before { background: var(--kotlin); }
        .card.java::before { background: var(--java); }
        .card.ai::before { background: var(--ai); }
        .card.multi::before { background: linear-gradient(to bottom, var(--accent), var(--accent2)); }

        .card:hover {
          border-color: #353550;
          transform: translateX(4px);
        }

        .day-num {
          font-family: 'Space Mono', monospace;
          font-size: 22px;
          font-weight: 700;
          color: var(--muted);
          line-height: 1;
          padding-top: 2px;
        }

        .card-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 6px;
          line-height: 1.3;
        }

        .card-desc {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.6;
          margin-bottom: 10px;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag {
          font-size: 11px;
          font-family: 'Space Mono', monospace;
          padding: 3px 8px;
          border-radius: 3px;
          background: var(--tag-bg);
          border: 1px solid var(--border);
        }

        .tag.go { color: var(--go); border-color: rgba(0,172,215,0.3); }
        .tag.kotlin { color: var(--kotlin); border-color: rgba(169,123,255,0.3); }
        .tag.java { color: var(--java); border-color: rgba(248,152,32,0.3); }
        .tag.ai { color: var(--ai); border-color: rgba(0,212,170,0.3); }
        .tag.tip { color: #e8e8f0; }

        .card-type {
          font-size: 11px;
          font-family: 'Space Mono', monospace;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          white-space: nowrap;
          margin-top: 3px;
        }

        .tips-section {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 32px;
          margin-top: 60px;
        }

        .tips-title {
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          letter-spacing: 2px;
          color: var(--accent2);
          text-transform: uppercase;
          margin-bottom: 20px;
          text-align: left;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .tip-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 16px;
          text-align: left;
        }

        .tip-icon {
          font-size: 22px;
          margin-bottom: 8px;
        }

        .tip-head {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .tip-body {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.6;
        }

        .footer {
          text-align: center;
          margin-top: 60px;
          font-size: 12px;
          color: var(--muted);
          font-family: 'Space Mono', monospace;
        }

        @media (max-width: 600px) {
          .card { grid-template-columns: 36px 1fr; }
          .card-type { display: none; }
        }
      ` }} />

      <div className="guide-container">
        <div className="flex justify-start mb-8">
          <Button onClick={() => navigate("/profiles")} variant="ghost" className="text-muted hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profiles
          </Button>
        </div>

        <div className="header">
          <div className="badge">Go · Kotlin · Java · AI</div>
          <h1>Your <span>30-Day LinkedIn</span><br />Content Playbook</h1>
          <p className="subtitle">Intern Edition — Backend Dev meets AI Industry</p>
        </div>

        <div className="legend">
          <div className="legend-item"><div className="dot" style={{ background: 'var(--go)' }}></div> Go</div>
          <div className="legend-item"><div className="dot" style={{ background: 'var(--kotlin)' }}></div> Kotlin</div>
          <div className="legend-item"><div className="dot" style={{ background: 'var(--java)' }}></div> Java</div>
          <div className="legend-item"><div className="dot" style={{ background: 'var(--ai)' }}></div> AI / Industry</div>
          <div className="legend-item"><div className="dot" style={{ background: 'var(--accent)' }}></div> Career</div>
        </div>

        {/* WEEK 1 */}
        <div className="week">
          <div className="week-header">
            <span className="week-num">WEEK 01</span>
            <span className="week-title">Establishing Your Voice</span>
            <div className="week-line"></div>
          </div>
          <div className="cards">
            <div className="card multi">
              <div className="day-num">01</div>
              <div className="card-body">
                <div className="card-title">Introduce yourself — 3 languages, 1 goal</div>
                <div className="card-desc">Share your stack: Go for performance, Kotlin for expressiveness, Java as your foundation. Why backend dev? What drew you to systems thinking? Personal + professional hook.</div>
                <div className="tags"><span className="tag tip">#BackendDev</span><span className="tag tip">#SoftwareEngineering</span><span className="tag tip">#Internship</span></div>
              </div>
              <div className="card-type">Intro</div>
            </div>
            <div className="card go">
              <div className="day-num">02</div>
              <div className="card-body">
                <div className="card-title">Why Go's concurrency model changed how I think about code</div>
                <div className="card-desc">Goroutines vs threads. Share a simple goroutine + channel snippet and what surprised you. Relate to real-world backend scalability.</div>
                <div className="tags"><span className="tag go">#Go</span><span className="tag go">#Golang</span><span className="tag tip">#Concurrency</span></div>
              </div>
              <div className="card-type">Technical</div>
            </div>
            <div className="card kotlin">
              <div className="day-num">03</div>
              <div className="card-body">
                <div className="card-title">Kotlin vs Java: same JVM, very different feel</div>
                <div className="card-desc">Data classes, null safety, extension functions. Post a side-by-side comparison showing how Kotlin eliminates boilerplate. Great engagement bait for Java devs.</div>
                <div className="tags"><span className="tag kotlin">#Kotlin</span><span className="tag java">#Java</span><span className="tag tip">#JVM</span></div>
              </div>
              <div className="card-type">Comparison</div>
            </div>
            <div className="card ai">
              <div className="day-num">04</div>
              <div className="card-body">
                <div className="card-title">How I use AI tools daily as a backend intern</div>
                <div className="card-desc">Be honest and specific: GitHub Copilot for boilerplate, Claude/ChatGPT for debugging Kotlin coroutines, AI for reading Go docs faster. Share actual workflow, not hype.</div>
                <div className="tags"><span className="tag ai">#AITools</span><span className="tag ai">#DeveloperProductivity</span><span className="tag tip">#Copilot</span></div>
              </div>
              <div className="card-type">AI Trend</div>
            </div>
            <div className="card java">
              <div className="day-num">05</div>
              <div className="card-body">
                <div className="card-title">Java features I wish I knew before learning Kotlin</div>
                <div className="card-desc">Records (Java 16+), sealed classes, pattern matching. Show how modern Java closes the gap with Kotlin. Helps position you as someone who knows both deeply.</div>
                <div className="tags"><span className="tag java">#Java</span><span className="tag java">#ModernJava</span><span className="tag tip">#JDK21</span></div>
              </div>
              <div className="card-type">Technical</div>
            </div>
          </div>
        </div>

        {/* WEEK 2 */}
        <div className="week">
          <div className="week-header">
            <span className="week-num">WEEK 02</span>
            <span className="week-title">Deep Dives & Industry Relevance</span>
            <div className="week-line"></div>
          </div>
          <div className="cards">
            <div className="card go">
              <div className="day-num">08</div>
              <div className="card-body">
                <div className="card-title">Building a tiny REST API in Go — what I learned</div>
                <div className="card-desc">Walk through net/http or Gin/Fiber. Share a snippet, one surprise, one gotcha. "I built X in a weekend" posts are highly relatable.</div>
                <div className="tags"><span className="tag go">#Go</span><span className="tag go">#Backend</span><span className="tag tip">#RESTAPI</span></div>
              </div>
              <div className="card-type">Technical</div>
            </div>
            <div className="card kotlin">
              <div className="day-num">09</div>
              <div className="card-body">
                <div className="card-title">Coroutines: Kotlin's secret weapon for efficiency</div>
                <div className="card-desc">Explain structured concurrency in simple terms. Why is it better than callbacks or raw threads? Great for showing you understand modern async patterns.</div>
                <div className="tags"><span className="tag kotlin">#Kotlin</span><span className="tag tip">#Coroutines</span><span className="tag tip">#Async</span></div>
              </div>
              <div className="card-type">Technical</div>
            </div>
            <div className="card ai">
              <div className="day-num">11</div>
              <div className="card-body">
                <div className="card-title">LLMs for Code: My best prompt for refactoring Java</div>
                <div className="card-desc">Share a "Before and After" of a Java method refactored using an LLM. Explain what you asked and how it improved the code. Pure value for your followers.</div>
                <div className="tags"><span className="tag ai">#AI</span><span className="tag java">#Java</span><span className="tag tip">#Refactoring</span></div>
              </div>
              <div className="card-type">AI Tip</div>
            </div>
          </div>
        </div>

        {/* WEEK 3 */}
        <div className="week">
          <div className="week-header">
            <span className="week-num">WEEK 03</span>
            <span className="week-title">Advanced Patterns & Future Tech</span>
            <div className="week-line"></div>
          </div>
          <div className="cards">
            <div className="card ai">
              <div className="day-num">18</div>
              <div className="card-body">
                <div className="card-title">MCP (Model Context Protocol) — what backend devs need to know</div>
                <div className="card-desc">Anthropic's MCP is becoming a standard for AI tool integration. Explain what it is, why backend engineers will be building these servers, and what skills transfer from your Go/Kotlin stack.</div>
                <div className="tags"><span className="tag ai">#MCP</span><span className="tag ai">#AIAgents</span><span className="tag go">#Go</span></div>
              </div>
              <div className="card-type">AI Trend</div>
            </div>
          </div>
        </div>

        {/* WEEK 4 */}
        <div className="week">
          <div className="week-header">
            <span className="week-num">WEEK 04</span>
            <span className="week-title">Learnings, Growth & Looking Forward</span>
            <div className="week-line"></div>
          </div>
          <div className="cards">
            <div className="card multi">
              <div className="day-num">22</div>
              <div className="card-body">
                <div className="card-title">3 things my internship taught me that no tutorial could</div>
                <div className="card-desc">Reading real production code, understanding why decisions were made (not just what), and asking "why" in code reviews. Authentic internship reflections get massive engagement.</div>
                <div className="tags"><span className="tag tip">#Internship</span><span className="tag tip">#SoftSkills</span><span className="tag tip">#GrowthMindset</span></div>
              </div>
              <div className="card-type">Reflection</div>
            </div>
            <div className="card kotlin">
              <div className="day-num">23</div>
              <div className="card-body">
                <div className="card-title">Kotlin Multiplatform is quietly becoming a big deal</div>
                <div className="card-desc">KMP lets you share business logic across Android, iOS, and backend. It's gaining traction in 2025. Great opportunity to position yourself as someone watching industry trends.</div>
                <div className="tags"><span className="tag kotlin">#KotlinMultiplatform</span><span className="tag kotlin">#KMP</span><span className="tag tip">#CrossPlatform</span></div>
              </div>
              <div className="card-type">Industry</div>
            </div>
            <div className="card ai">
              <div className="day-num">24</div>
              <div className="card-body">
                <div className="card-title">Vibe coding vs real engineering — where's the line?</div>
                <div className="card-desc">Hot take on AI-generated code in production. When is it fine to ship AI-written code? When is it dangerous? Your perspective as an intern who uses both mindfully.</div>
                <div className="tags"><span className="tag ai">#VibeCoding</span><span className="tag ai">#AIAssisted</span><span className="tag tip">#Engineering</span></div>
              </div>
              <div className="card-type">Opinion</div>
            </div>
            <div className="card go">
              <div className="day-num">25</div>
              <div className="card-body">
                <div className="card-title">Writing a Go CLI tool in a weekend — step by step</div>
                <div className="card-desc">Cobra + Viper for a real CLI. Share the repo, what you built, what you'd do differently. Projects + writeups signal initiative and are great for your portfolio.</div>
                <div className="tags"><span className="tag go">#Go</span><span className="tag tip">#CLI</span><span className="tag tip">#OpenSource</span></div>
              </div>
              <div className="card-type">Project</div>
            </div>
            <div className="card multi">
              <div className="day-num">26</div>
              <div className="card-body">
                <div className="card-title">Resources that leveled up my backend skills (free & paid)</div>
                <div className="card-desc">Go tour, Kotlin docs, Effective Java, System Design primer, specific YouTube channels. Curated list posts get saved and shared widely — great for reach.</div>
                <div className="tags"><span className="tag tip">#Resources</span><span className="tag tip">#Learning</span><span className="tag tip">#BackendDev</span></div>
              </div>
              <div className="card-type">Value</div>
            </div>
            <div className="card ai">
              <div className="day-num">29</div>
              <div className="card-body">
                <div className="card-title">AI Agents need backend engineers — here's why</div>
                <div className="card-desc">Agents need APIs, queues, databases, auth, observability — everything you're learning. Position your backend skills as the foundation of the AI era. Empowering take.</div>
                <div className="tags"><span className="tag ai">#AIAgents</span><span className="tag ai">#AIEngineering</span><span className="tag tip">#FutureOfWork</span></div>
              </div>
              <div className="card-type">AI Trend</div>
            </div>
            <div className="card multi">
              <div className="day-num">30</div>
              <div className="card-body">
                <div className="card-title">30 days of posting — what I learned about sharing in public</div>
                <div className="card-desc">Wrap up: what got engagement, what didn't, what surprised you. This meta-post builds credibility and shows self-awareness. Great conversation starter for recruiters.</div>
                <div className="tags"><span className="tag tip">#BuildInPublic</span><span className="tag tip">#Reflection</span><span className="tag tip">#TechCommunity</span></div>
              </div>
              <div className="card-type">Reflection</div>
            </div>
          </div>
        </div>

        {/* TIPS */}
        <div className="tips-section">
          <div className="tips-title">// Post-writing tips</div>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">🪝</div>
              <div className="tip-head">Hook in line 1</div>
              <div className="tip-body">LinkedIn cuts off after 2 lines. Start with a bold claim, question, or number. "I learned more about Go in one day of production debugging than in 2 weeks of tutorials."</div>
            </div>
            <div className="tip-card">
              <div className="tip-icon">💻</div>
              <div className="tip-head">Code screenshots win</div>
              <div className="tip-body">Use carbon.now.sh for beautiful code screenshots. Technical posts with visuals get 2–3x more impressions than plain text posts.</div>
            </div>
            <div className="tip-card">
              <div className="tip-icon">🕗</div>
              <div className="tip-head">Best posting times</div>
              <div className="tip-body">Tue–Thu, 7–9am or 12–1pm in your local timezone. Avoid weekends. Consistency beats perfection — post even if it's not perfect.</div>
            </div>
            <div className="tip-card">
              <div className="tip-icon">💬</div>
              <div className="tip-head">Engage for 30 mins</div>
              <div className="tip-body">Reply to every comment within the first 30 minutes of posting. LinkedIn's algorithm rewards comment velocity heavily in the early window.</div>
            </div>
            <div className="tip-card">
              <div className="tip-icon">🏷️</div>
              <div className="tip-head">3–5 hashtags max</div>
              <div className="tip-body">More than 5 looks spammy. Choose 1 broad (#SoftwareEngineering), 1 specific (#Golang), 1 trending (#AITools). Rotate to test reach.</div>
            </div>
            <div className="tip-card">
              <div className="tip-icon">🎯</div>
              <div className="tip-head">Write to one person</div>
              <div className="tip-body">Imagine a junior dev just like you reading this. Speak directly to them. Personal, specific posts outperform generic "here are 5 tips" content every time.</div>
            </div>
          </div>
        </div>

        <div className="footer">// 30 posts · 4 weeks · your developer brand — built in public</div>
      </div>
    </div>
  );
}
