

//rate limiter
/*
Core entities:
1. RateLimitingStrategy (Interface)
    TokenBucket
    SlidingFixed
2. RateLimitingService
3. DriveClass
4. Request
    --> UserId,
    --> IP address/
    --> HASH
----- Add if needed -----
*/

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.print.attribute.HashAttributeSet;

class Request{
    private String userId;
    private long ip;
    public Request(String userId, long ip){
        this.userId = userId;
        this.ip = ip;
    }
    public String getUserId(){
        return userId;
    }
}

interface RateLimitingStrategy{
    public boolean isAllowed(Request request);
}

class TokenBucket{
    private int capacity;
    private int tokens; //number of requests
    long lastRefillTime;
    private int refillRate; // number of tokens / minutes..
    public TokenBucket(int capacity, int refillRate){
        this.capacity = capacity;
        this.tokens = capacity;
        lastRefillTime = System.currentTimeMillis();
        this.refillRate = refillRate;
    }

    synchronized boolean isAllowed(){
        refill();
        if(tokens == 0){
            return false;
        }
        tokens--;
        System.out.println("Allowed: "+System.currentTimeMillis());
        return true;
    }

    void refill(){
        long now = System.currentTimeMillis();
        long diff = (now - lastRefillTime)/1000; //differencee in seconds
        int tokensAdded = (int)diff*refillRate;  // diff * refillRate...
        if(tokensAdded > 0){
            // then only a valid
            System.out.println("Refill: "+System.currentTimeMillis());
            tokens = Math.min(capacity, tokens + tokensAdded);
            lastRefillTime = System.currentTimeMillis();
        }
    }
}


class TokenBucketStrategy implements RateLimitingStrategy{
    Map<String, TokenBucket> tokens_repository;
    private int capacity;
    private int refillRate;
    public TokenBucketStrategy(int capacity, int refillRate){
        tokens_repository = new ConcurrentHashMap<>();
        this.capacity = capacity;
        this.refillRate = refillRate;
    }
     public boolean isAllowed(Request request){
        //two ways one way is commented
        // if(tokens_repository.containsKey(request.getUserId())){
        //     TokenBucket bucket = tokens_repository.get(request.getUserId());
        //     return bucket.isAllowed();
        // }else{
        //     TokenBucket bucket = new TokenBucket(capacity, refillRate);
        //     tokens_repository.put(request.getUserId(), bucket);
        //     return bucket.isAllowed();
        // }
        TokenBucket bucket = tokens_repository.computeIfAbsent(request.getUserId(), k->new TokenBucket(capacity, refillRate));
        return bucket.isAllowed();
    }
}

// class SlidingWindow implements RateLimitingStrategy{
//     boolean isAllowed(Request request){
//         // logic for Sliding window...
//     }
// }

class RateLimitingService{
    RateLimitingStrategy rateLimitingStrategy;
    public RateLimitingService(RateLimitingStrategy rateLimitingStrategy){

        this.rateLimitingStrategy = rateLimitingStrategy;
    }
    void submitRequest(Request request){
        if(rateLimitingStrategy.isAllowed(request)){
            System.out.println("Request is accepted");
        }else{
            System.out.println("429, Request is rate limited");
        }
    }
}

public class RateLimiter_demo {
    public static void main(String[] args) {
        RateLimitingService service = new RateLimitingService(new TokenBucketStrategy(3,1)); // token =3 and refill rate = 1 token per second


        for(int i = 1; i <= 10; i++){
            service.submitRequest(new Request("user_id", i));
            try{
                Thread.sleep(500);
            }catch(InterruptedException e){
                System.out.println(e);
            }
        }
    }
}


//kong vs nginx vs manage service provider like cloudflare, aws, azure, gcp, etc..₹

//blocking the country
//envoy, kong, nginx, cloudflare, aws, azure, gcp, etc.. 
//all of them provide the feature of blocking the country. You can block the country by using the IP address of the incoming request.
//  Each country has a range of IP addresses associated with it. 
// By blocking the IP addresses associated with a particular country, you can effectively block traffic from that country. 
// This can be done through firewall rules or by configuring the web server to reject requests from those IP addresses. 
// Additionally, some services also provide geolocation-based blocking, which allows you to block traffic based on the geographic 
// location of the incoming request. 
// geo-blocking can be implemented using a geolocation database that maps IP addresses to geographic locations.
// route53, cloudflare, aws, azure, gcp, etc.. all of them provide the feature of blocking the country. 
// You can block the country by using the IP address of the incoming request. 
// Each country has a range of IP addresses associated with it. 
// By blocking the IP addresses associated with a particular country, you can effectively block traffic from that country. 
// This can be done through firewall rules or by configuring the web server to reject requests from those IP addresses. 
// Additionally, some services also provide geolocation-based blocking, 
// which allows you to block traffic based on the geographic location of the incoming request. 
// Geo-blocking can be implemented using a geolocation database that maps IP addresses to geographic locations.
