package dev.EchoTranscribe.service;
// package dev.EchoTranscribe.config;
// // import com.cloudinary.Cloudinary;
// // import com.cloudinary.utils.ObjectUtils;
// // import org.springframework.context.annotation.Bean;
// // import org.springframework.context.annotation.Configuration;
// // import io.github.cdimascio.dotenv.Dotenv;

// // @Configuration

// // public class CloudinaryConfig {

// //     @Bean
// //     public Cloudinary cloudinary() {
// //         Dotenv dotenv = Dotenv.load();
// //         return new Cloudinary(ObjectUtils.asMap(
// //       "cloud_name", dotenv.get("CLOUDINARY_NAME"),
// //                 "api_key", dotenv.get("CLOUDINARY_KEY"),
// //                 "api_secret", dotenv.get("CLOUDINARY_SECRET")));
// //     }
// // }
// import com.cloudinary.Cloudinary;
// import com.cloudinary.utils.ObjectUtils;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.stereotype.Service;
// // import org.springframework.web.multipart.MultipartFile;

// import java.io.IOException;
// import java.util.Map;

// @Configuration
// public class CloudinaryService {


//     @Value("${cloudinary.cloud.name}")
//     private String cloudName;

//     @Value("${cloudinary.api.key}")
//     private String apiKey;

//     @Value("${cloudinary.api.secret}")
//     private String apiSecret;

//     private final Cloudinary cloudinary;
//     @Autowired
//     public CloudinaryService() {
//         // Dotenv dotenv = Dotenv.load();
//         this.cloudinary = new Cloudinary(ObjectUtils.asMap(
//                   "cloud_name", "dscjf5irc",
//                             "api_key", "969898684382947",
//                             "api_secret", "0C7qelpu3Wl6JhGF3nUMpyuZtBE"));
//     }
//     @SuppressWarnings("unchecked")
//     public Map<String, Object> uploadAudio() throws IOException {
//         Map<String, Boolean> params = ObjectUtils.asMap(
//         "use_filename", true,
//                     "unique_filename", false,
//                         "overwrite", true
// );
//         return (Map<String, Object>) cloudinary.uploader().upload("https://cloudinary-devs.github.io/cld-docs-assets/assets/images/coffee_cup.jpg", params);
//     }
// }
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import jakarta.annotation.Resource;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Resource
    private Cloudinary cloudinary;


    @SuppressWarnings("unchecked")
    public Map<String, Object> uploadAudio(MultipartFile file, String fileName) throws IOException {
        try {
            // HashMap<Object, Object> options = new HashMap<>();
            // options.put("folder", "Apartment-seeker");
            Map<String, Boolean> params = ObjectUtils.asMap(
                    "use_filename", false,
                    "unique_filename", true,
                    "folder", "Eco-Transcribe",
                    "resource_type", "auto",
                    "filename_override",fileName,
                    "overwrite", true);
            return (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(), params);
        }catch(IOException e){
            e.printStackTrace();
            return null;
        }
    }
}
