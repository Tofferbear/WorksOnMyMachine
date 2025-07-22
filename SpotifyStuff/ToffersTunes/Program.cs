using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ToffersTunes.Handlers;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((serviceCollection) =>
    {
        // Singleton registration
        serviceCollection.AddSingleton<ISpotifyHandler, SpotifyHandler>();
    })
    .Build();

host.Run();
