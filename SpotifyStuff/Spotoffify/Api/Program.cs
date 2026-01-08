using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Spotoffify.Shared;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services => {
        services.AddHttpClient();
        services.AddScoped<SpotifyService>();

        // Setup the Cosmos Client
        services.AddSingleton(sp =>
        {
            var connectionString = Environment.GetEnvironmentVariable("CosmosConnectionString");

            return new CosmosClient(connectionString, new CosmosClientOptions
            {
                SerializerOptions = new CosmosSerializationOptions
                {
                    PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                }
            });
        });
    })
    .Build();

await EnsureCosmosDbIsSetup(host);

await host.RunAsync();

// Helper method to keep Program.cs clean
async Task EnsureCosmosDbIsSetup(IHost host)
{
    using var scope = host.Services.CreateScope();
    var client = scope.ServiceProvider.GetRequiredService<CosmosClient>();

    // Create Database
    var database = await client.CreateDatabaseIfNotExistsAsync("SpotoffifyDB");

    // Create Container (Partition Key is vital: we'll use TrackId)
    await database.Database.CreateContainerIfNotExistsAsync(
        id: "Plays",
        partitionKeyPath: "/trackId",
        throughput: 400); // 400 RU/s is the minimum (and free in many cases)
}
