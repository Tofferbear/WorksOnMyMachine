using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Spotoffify.Client;
using Spotoffify.Client.Services;
using Spotoffify.Shared;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

// --- CONFIGURATION ---
// Set this to TRUE if you want to test against the Live Cloud Backend while running locally.
// Set this to FALSE if you want to debug against your local running Function (localhost:7071).
bool useCloudBackend = true;

var apiUrl = (builder.HostEnvironment.IsDevelopment() && !useCloudBackend)
    ? "http://localhost:7071/"
    : "https://spotoffifyfunctions.azurewebsites.net/"; // Your Live Flex Function URL

// Configure HttpClient to point to the chosen backend
builder.Services.AddScoped(sp => new HttpClient
{
    BaseAddress = new Uri(apiUrl)
});

// Register Services
builder.Services.AddScoped<UiSpotifyService>();

await builder.Build().RunAsync();
