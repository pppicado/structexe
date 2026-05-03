import { _exe_ } from './src/structexe';
import { TypeStruct_exe_, datChangeObj } from './src/inernalUtils';

function runTests() {
    console.log("=== STRUCTEXE TEST SUITE ===\n");

    console.log("Test 1: Initialization & Proxies");
    const rawData = {
        app: {
            name: "TestApp",
            version: 1,
            flags: new Set(['active'])
        },
        users: new Map([['u1', 'Alice']])
    } as any;

    const state = _exe_.newStruct_exe_(rawData);
    console.log("✅ Proxy created successfully");
    console.log(`Path of root: ${_exe_.path(state)}`);
    console.log(`Path of app.name: ${_exe_.path(state.app.name)}`);


    console.log("\nTest 2: Basic Mutations & Types");
    state.app.version = 2;
    console.log(`Version updated using native assignment. Value is: ${state.app.version.valueOf()}`);
    console.log(`Is version wrapped in Box?`, typeof state.app.version === 'object');


    console.log("\nTest 3: Deep Reactions");
    let reactionFired = false;
    _exe_.react(state, "/|app|name", (change) => {
        reactionFired = true;
        console.log(`Event Fired! Old Name: ${change.datoActual}, New Name: ${change.datoNuevo}`);
    });

    state.app.name = "SuperTestApp";
    if (reactionFired) console.log("✅ Reaction successfully intercepted PrimitiveBox modification.");
    else console.error("❌ Reaction failed.");


    console.log("\nTest 4: Auto-vivification via _exe_.set");
    let addedReactionFired = false;
    _exe_.react(state, new datChangeObj({ ruta: "/|app|config|theme", hito: 0 }) as any, (change) => {
        addedReactionFired = true;
    });

    _exe_.set(state, "app|config|theme", "dark");
    console.log(`Auto-created config theme: ${state.app.config.theme}`);
    if (addedReactionFired) console.log("✅ Reaction fired for auto-created deep property.");


    console.log("\nTest 5: Map and Set Mutations");
    state.app.flags.add("premium");
    console.log(`Set size: ${state.app.flags.size}, Has premium? ${state.app.flags.has("premium")}`);

    state.users.set('u2', 'Bob');
    console.log(`Map size: ${state.users.size}, User u2: ${state.users.get('u2')}`);


    console.log("\nTest 6: Exporting Clean Data");
    const exported = _exe_.export(state);
    console.log("Raw JSON output:");
    console.log(JSON.stringify(exported, null, 2));


    console.log("\n=== TESTS COMPLETE ===");
}

runTests();
