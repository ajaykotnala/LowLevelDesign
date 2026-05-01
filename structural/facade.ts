// Complex subsystems — each has its own detailed interface
class Amplifier {
    on(): void                  { console.log("Amplifier: on"); }
    setVolume(level: number): void { console.log(`Amplifier: volume → ${level}`); }
    off(): void                 { console.log("Amplifier: off"); }
}

class Projector {
    on(): void                    { console.log("Projector: on"); }
    setInput(source: string): void { console.log(`Projector: input → ${source}`); }
    off(): void                   { console.log("Projector: off"); }
}

class StreamingDevice {
    play(title: string): void { console.log(`Streaming: playing "${title}"`); }
    stop(): void               { console.log("Streaming: stopped"); }
}

class Lights {
    dim(level: number): void  { console.log(`Lights: dimmed to ${level}%`); }
    on(): void                 { console.log("Lights: on"); }
}

// Facade — one simple interface over all four subsystems
class HomeTheatreFacade {
    private amp    = new Amplifier();
    private proj   = new Projector();
    private stream = new StreamingDevice();
    private lights = new Lights();

    watchMovie(title: string): void {
        console.log("--- Starting movie night ---");
        this.lights.dim(20);
        this.amp.on(); this.amp.setVolume(7);
        this.proj.on(); this.proj.setInput("streaming");
        this.stream.play(title);
    }

    endMovie(): void {
        console.log("--- Ending movie night ---");
        this.stream.stop();
        this.proj.off();
        this.amp.off();
        this.lights.on();
    }
}

// Client — one call, all the complexity handled internally
const theatre = new HomeTheatreFacade();
theatre.watchMovie("Inception");
// --- Starting movie night ---
// Lights: dimmed to 20%
// Amplifier: on  |  Amplifier: volume → 7
// Projector: on  |  Projector: input → streaming
// Streaming: playing "Inception"

theatre.endMovie();