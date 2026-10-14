package com.cab.booking.config;

import com.cab.booking.entity.*;
import com.cab.booking.enums.*;
import com.cab.booking.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final RideRepository rideRepository;
    private final PaymentRepository paymentRepository;
    private final RatingRepository ratingRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DriverRepository driverRepository,
                           RideRepository rideRepository,
                           PaymentRepository paymentRepository,
                           RatingRepository ratingRepository,
                           PromoCodeRepository promoCodeRepository,
                           SupportTicketRepository supportTicketRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.rideRepository = rideRepository;
        this.paymentRepository = paymentRepository;
        this.ratingRepository = ratingRepository;
        this.promoCodeRepository = promoCodeRepository;
        this.supportTicketRepository = supportTicketRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private static class DriverSeed {
        final String name;
        final String email;
        final String phone;
        final String license;
        final String model;
        final String plate;
        final VehicleType type;
        final double lat;
        final double lng;
        final double rating;
        final int ratingsCount;
        final int totalRides;
        final double earnings;

        DriverSeed(String name, String email, String phone, String license, String model,
                   String plate, VehicleType type, double lat, double lng,
                   double rating, int ratingsCount, int totalRides, double earnings) {
            this.name = name;
            this.email = email;
            this.phone = phone;
            this.license = license;
            this.model = model;
            this.plate = plate;
            this.type = type;
            this.lat = lat;
            this.lng = lng;
            this.rating = rating;
            this.ratingsCount = ratingsCount;
            this.totalRides = totalRides;
            this.earnings = earnings;
        }
    }

    private Driver createDriver(DriverSeed s) {
        User user = new User(
                s.name,
                s.email,
                passwordEncoder.encode("driver123"),
                s.phone,
                Role.ROLE_DRIVER
        );
        userRepository.save(user);

        Driver driver = new Driver(
                user,
                s.license,
                s.model,
                s.plate,
                s.type
        );
        driver.setCurrentLatitude(s.lat);
        driver.setCurrentLongitude(s.lng);
        driver.setIsOnline(true);
        driver.setIsAvailable(true);
        driver.setRating(s.rating);
        driver.setTotalRatingsCount(s.ratingsCount);
        driver.setTotalRides(s.totalRides);
        driver.setTotalEarnings(s.earnings);
        return driverRepository.save(driver);
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }

        logger.info("Seeding initial data for Cab Booking application...");

        // 1. Admin Account
        User admin = new User(
                "System Administrator",
                "admin@uber.com",
                passwordEncoder.encode("admin123"),
                "+91-98000-00199",
                Role.ROLE_ADMIN
        );
        userRepository.save(admin);

        // 2. Rider Account
        User rider = new User(
                "Alex Rivera (Rider)",
                "rider@uber.com",
                passwordEncoder.encode("rider123"),
                "+91-98111-23456",
                Role.ROLE_RIDER
        );
        userRepository.save(rider);

        // 3. SEED 55 ACTIVE DRIVERS IN NEW DELHI NCR
        List<DriverSeed> delhiDrivers = new ArrayList<>();
        delhiDrivers.add(new DriverSeed("John Carter", "driver.john@uber.com", "+91-98101-00001", "DL-01-2019-001", "Toyota Camry Hybrid", "DL-1Z-AA-1001", VehicleType.COMFORT, 28.6315, 77.2167, 4.92, 142, 160, 48500.0));
        delhiDrivers.add(new DriverSeed("Sarah Connor", "driver.sarah@uber.com", "+91-98101-00002", "DL-01-2020-002", "Hyundai Ioniq EV", "DL-1Z-BB-1002", VehicleType.ECONOMY, 28.6129, 77.2295, 4.88, 98, 115, 34200.0));
        delhiDrivers.add(new DriverSeed("Mike Vance", "driver.mike@uber.com", "+91-98101-00003", "DL-01-2018-003", "Toyota Innova Crysta", "DL-1Y-CC-1003", VehicleType.XL, 28.5562, 77.1000, 4.98, 220, 245, 89400.0));
        delhiDrivers.add(new DriverSeed("Rajesh Kumar", "driver.delhi4@uber.com", "+91-98101-00004", "DL-02-2021-004", "Maruti Swift Dzire", "DL-1Z-DD-1004", VehicleType.ECONOMY, 28.6328, 77.2197, 4.85, 110, 130, 31000.0));
        delhiDrivers.add(new DriverSeed("Amit Sharma", "driver.delhi5@uber.com", "+91-98101-00005", "DL-03-2019-005", "Honda City ZX", "DL-2C-EE-1005", VehicleType.PREMIER, 28.6290, 77.2270, 4.94, 180, 205, 62000.0));
        delhiDrivers.add(new DriverSeed("Vikram Singh", "driver.delhi6@uber.com", "+91-98101-00006", "DL-04-2022-006", "Hyundai Aura", "DL-1Z-FF-1006", VehicleType.ECONOMY, 28.6003, 77.2270, 4.81, 75, 90, 22500.0));
        delhiDrivers.add(new DriverSeed("Manoj Verma", "driver.delhi7@uber.com", "+91-98101-00007", "DL-05-2020-007", "Maruti Ertiga Hybrid", "DL-3C-GG-1007", VehicleType.XL, 28.5850, 77.2220, 4.89, 135, 150, 49800.0));
        delhiDrivers.add(new DriverSeed("Suresh Yadav", "driver.delhi8@uber.com", "+91-98101-00008", "DL-06-2019-008", "Toyota Glanza", "DL-1Z-HH-1008", VehicleType.COMFORT, 28.5665, 77.1231, 4.90, 160, 180, 53000.0));
        delhiDrivers.add(new DriverSeed("Rahul Gupta", "driver.delhi9@uber.com", "+91-98101-00009", "DL-07-2021-009", "Hyundai Verna Turbo", "DL-2C-II-1009", VehicleType.PREMIER, 28.5504, 77.1213, 4.96, 210, 230, 71500.0));
        delhiDrivers.add(new DriverSeed("Deepak Kumar", "driver.delhi10@uber.com", "+91-98101-00010", "DL-08-2020-010", "WagonR CNG", "DL-1Z-JJ-1010", VehicleType.ECONOMY, 28.5440, 77.1280, 4.78, 92, 105, 27400.0));
        delhiDrivers.add(new DriverSeed("Sandeep Singh", "driver.delhi11@uber.com", "+91-98101-00011", "DL-09-2018-011", "Honda Amaze", "DL-1Z-KK-1011", VehicleType.COMFORT, 28.6429, 77.2195, 4.91, 140, 165, 46700.0));
        delhiDrivers.add(new DriverSeed("Anil Chaudhary", "driver.delhi12@uber.com", "+91-98101-00012", "DL-10-2022-012", "Kia Carens Luxury", "DL-3C-LL-1012", VehicleType.XL, 28.6619, 77.2301, 4.87, 105, 120, 39900.0));
        delhiDrivers.add(new DriverSeed("Harish Chandra", "driver.delhi13@uber.com", "+91-98101-00013", "DL-11-2019-013", "Tata Tigor EV", "DL-1Z-MM-1013", VehicleType.ECONOMY, 28.6506, 77.2303, 4.83, 88, 102, 26800.0));
        delhiDrivers.add(new DriverSeed("Kunal Mehra", "driver.delhi14@uber.com", "+91-98101-00014", "DL-12-2020-014", "Hyundai Creta SX", "DL-2C-NN-1014", VehicleType.PREMIER, 28.6562, 77.2410, 4.93, 175, 195, 60400.0));
        delhiDrivers.add(new DriverSeed("Gaurav Sethi", "driver.delhi15@uber.com", "+91-98101-00015", "DL-13-2021-015", "Maruti Baleno Delta", "DL-1Z-OO-1015", VehicleType.COMFORT, 28.6675, 77.2285, 4.86, 120, 135, 38500.0));
        delhiDrivers.add(new DriverSeed("Naveen Tiwari", "driver.delhi16@uber.com", "+91-98101-00016", "DL-14-2018-016", "Toyota Innova Crysta", "DL-3C-PP-1016", VehicleType.XL, 28.6810, 77.2250, 4.97, 240, 265, 96000.0));
        delhiDrivers.add(new DriverSeed("Vikas Rawat", "driver.delhi17@uber.com", "+91-98101-00017", "DL-15-2020-017", "Swift Dzire VXi", "DL-1Z-QQ-1017", VehicleType.ECONOMY, 28.6904, 77.2072, 4.82, 95, 110, 29800.0));
        delhiDrivers.add(new DriverSeed("Pawan Joshi", "driver.delhi18@uber.com", "+91-98101-00018", "DL-16-2021-018", "Skoda Slavia", "DL-2C-RR-1018", VehicleType.PREMIER, 28.7020, 77.1930, 4.95, 165, 185, 58000.0));
        delhiDrivers.add(new DriverSeed("Sunil Grover", "driver.delhi19@uber.com", "+91-98101-00019", "DL-17-2019-019", "Honda City 5th Gen", "DL-1Z-SS-1019", VehicleType.COMFORT, 28.6514, 77.1907, 4.89, 130, 145, 44200.0));
        delhiDrivers.add(new DriverSeed("Tarun Ahuja", "driver.delhi20@uber.com", "+91-98101-00020", "DL-18-2022-020", "WagonR ZXi", "DL-1Z-TT-1020", VehicleType.ECONOMY, 28.6420, 77.1810, 4.80, 80, 95, 24000.0));
        delhiDrivers.add(new DriverSeed("Ashok Malik", "driver.delhi21@uber.com", "+91-98101-00021", "DL-19-2018-021", "Maruti XL6 Alpha", "DL-3C-UU-1021", VehicleType.XL, 28.6530, 77.1650, 4.92, 190, 210, 74500.0));
        delhiDrivers.add(new DriverSeed("Rohit Bhasin", "driver.delhi22@uber.com", "+91-98101-00022", "DL-20-2020-022", "Hyundai Aura SX", "DL-1Z-VV-1022", VehicleType.COMFORT, 28.5494, 77.1947, 4.88, 115, 130, 36800.0));
        delhiDrivers.add(new DriverSeed("Arun Sehgal", "driver.delhi23@uber.com", "+91-98101-00023", "DL-21-2021-023", "Kia Seltos HTX", "DL-2C-WW-1023", VehicleType.PREMIER, 28.5580, 77.2050, 4.96, 200, 220, 68000.0));
        delhiDrivers.add(new DriverSeed("Ajay Pandey", "driver.delhi24@uber.com", "+91-98101-00024", "DL-22-2019-024", "Tata Punch EV", "DL-1Z-XX-1024", VehicleType.ECONOMY, 28.5672, 77.2100, 4.84, 102, 118, 30500.0));
        delhiDrivers.add(new DriverSeed("Pankaj Rana", "driver.delhi25@uber.com", "+91-98101-00025", "DL-23-2022-025", "Maruti Ertiga ZXi", "DL-3C-YY-1025", VehicleType.XL, 28.5733, 77.2223, 4.90, 145, 160, 52000.0));
        delhiDrivers.add(new DriverSeed("Devendra Solanki", "driver.delhi26@uber.com", "+91-98101-00026", "DL-24-2018-026", "Swift Dzire ZXi", "DL-1Z-ZZ-1026", VehicleType.COMFORT, 28.5700, 77.2400, 4.91, 155, 175, 49200.0));
        delhiDrivers.add(new DriverSeed("Manish Kapoor", "driver.delhi27@uber.com", "+91-98101-00027", "DL-25-2020-027", "Volkswagen Virtus GT", "DL-2C-AB-1027", VehicleType.PREMIER, 28.5482, 77.2344, 4.98, 230, 250, 81000.0));
        delhiDrivers.add(new DriverSeed("Hemant Bhatt", "driver.delhi28@uber.com", "+91-98101-00028", "DL-26-2021-028", "Hyundai Grand i10", "DL-1Z-AC-1028", VehicleType.ECONOMY, 28.5494, 77.2536, 4.79, 85, 98, 25300.0));
        delhiDrivers.add(new DriverSeed("Varun Dhawan", "driver.delhi29@uber.com", "+91-98101-00029", "DL-27-2019-029", "Toyota Innova Hycross", "DL-3C-AD-1029", VehicleType.XL, 28.5284, 77.2193, 4.95, 215, 235, 87500.0));
        delhiDrivers.add(new DriverSeed("Nitin Gadkari", "driver.delhi30@uber.com", "+91-98101-00030", "DL-28-2022-030", "Honda Amaze VX", "DL-1Z-AE-1030", VehicleType.COMFORT, 28.5245, 77.1855, 4.87, 125, 140, 41000.0));
        delhiDrivers.add(new DriverSeed("Rishi Narang", "driver.delhi31@uber.com", "+91-98101-00031", "DL-29-2018-031", "Hyundai Creta SX(O)", "DL-2C-AF-1031", VehicleType.PREMIER, 28.5402, 77.1558, 4.94, 185, 205, 65000.0));
        delhiDrivers.add(new DriverSeed("Jitendra Negi", "driver.delhi32@uber.com", "+91-98101-00032", "DL-30-2020-032", "Maruti Celerio CNG", "DL-1Z-AG-1032", VehicleType.ECONOMY, 28.5921, 77.1614, 4.83, 90, 105, 28100.0));
        delhiDrivers.add(new DriverSeed("Suraj Bhan", "driver.delhi33@uber.com", "+91-98101-00033", "DL-31-2021-033", "Toyota Innova Crysta", "DL-3C-AH-1033", VehicleType.XL, 28.5630, 77.1780, 4.96, 225, 245, 91200.0));
        delhiDrivers.add(new DriverSeed("Vipin Kaushik", "driver.delhi34@uber.com", "+91-98101-00034", "HR-26-2019-034", "Honda City Hybrid", "HR-26-AJ-1034", VehicleType.COMFORT, 28.4900, 77.0900, 4.93, 170, 190, 56000.0));
        delhiDrivers.add(new DriverSeed("Mohan Lal", "driver.delhi35@uber.com", "+91-98101-00035", "HR-26-2020-035", "Audi A4 Executive", "HR-26-AK-1035", VehicleType.PREMIER, 28.4870, 77.0850, 4.99, 260, 280, 105000.0));
        delhiDrivers.add(new DriverSeed("Lalit Mohan", "driver.delhi36@uber.com", "+91-98101-00036", "HR-26-2021-036", "Maruti Swift LXi", "HR-26-AL-1036", VehicleType.ECONOMY, 28.4950, 77.0930, 4.81, 86, 100, 25900.0));
        delhiDrivers.add(new DriverSeed("Dharmendra Tomar", "driver.delhi37@uber.com", "+91-98101-00037", "HR-26-2018-037", "Toyota Fortuner 4x2", "HR-26-AM-1037", VehicleType.XL, 28.4682, 77.0632, 4.97, 250, 275, 112000.0));
        delhiDrivers.add(new DriverSeed("Anand Swaroop", "driver.delhi38@uber.com", "+91-98101-00038", "HR-26-2022-038", "Hyundai Verna SX", "HR-26-AN-1038", VehicleType.PREMIER, 28.5042, 77.0968, 4.92, 160, 180, 57400.0));
        delhiDrivers.add(new DriverSeed("Bharat Bhushan", "driver.delhi39@uber.com", "+91-98101-00039", "HR-26-2020-039", "Maruti Baleno Alpha", "HR-26-AO-1039", VehicleType.COMFORT, 28.4550, 77.1020, 4.88, 135, 150, 44800.0));
        delhiDrivers.add(new DriverSeed("Praveen Dahiya", "driver.delhi40@uber.com", "+91-98101-00040", "HR-26-2021-040", "Tata Tiago EV", "HR-26-AP-1040", VehicleType.ECONOMY, 28.4200, 77.0390, 4.82, 94, 108, 28600.0));
        delhiDrivers.add(new DriverSeed("Shivam Tyagi", "driver.delhi41@uber.com", "+91-98101-00041", "UP-16-2019-041", "Honda Amaze Diesel", "UP-16-AQ-1041", VehicleType.COMFORT, 28.5708, 77.3260, 4.90, 150, 170, 50300.0));
        delhiDrivers.add(new DriverSeed("Harinder Pal", "driver.delhi42@uber.com", "+91-98101-00042", "UP-16-2020-042", "Toyota Innova Crysta", "UP-16-AR-1042", VehicleType.XL, 28.5672, 77.3211, 4.96, 235, 255, 94000.0));
        delhiDrivers.add(new DriverSeed("Satish Bhati", "driver.delhi43@uber.com", "+91-98101-00043", "UP-16-2021-043", "Hyundai Creta Knight", "UP-16-AS-1043", VehicleType.PREMIER, 28.6280, 77.3649, 4.94, 178, 198, 63500.0));
        delhiDrivers.add(new DriverSeed("Ajit Nagar", "driver.delhi44@uber.com", "+91-98101-00044", "UP-16-2018-044", "Maruti WagonR LXi", "UP-16-AT-1044", VehicleType.ECONOMY, 28.5820, 77.3130, 4.80, 89, 104, 27100.0));
        delhiDrivers.add(new DriverSeed("Mukesh Baisoya", "driver.delhi45@uber.com", "+91-98101-00045", "UP-16-2022-045", "Kia Carens Prestige", "UP-16-AU-1045", VehicleType.XL, 28.5130, 77.3750, 4.91, 142, 158, 51700.0));
        delhiDrivers.add(new DriverSeed("Chandan Jha", "driver.delhi46@uber.com", "+91-98101-00046", "UP-16-2020-046", "Swift Dzire VXi", "UP-16-AV-1046", VehicleType.COMFORT, 28.5662, 77.3190, 4.89, 138, 155, 47200.0));
        delhiDrivers.add(new DriverSeed("Dinesh Rawal", "driver.delhi47@uber.com", "+91-98101-00047", "DL-32-2019-047", "Maruti Ertiga VXi", "DL-3C-AW-1047", VehicleType.XL, 28.6469, 77.3160, 4.93, 185, 205, 68900.0));
        delhiDrivers.add(new DriverSeed("Rameshwar Dayal", "driver.delhi48@uber.com", "+91-98101-00048", "DL-33-2021-048", "Tata Nexon EV", "DL-1Z-AX-1048", VehicleType.PREMIER, 28.6127, 77.2773, 4.95, 192, 212, 72000.0));
        delhiDrivers.add(new DriverSeed("Girish Karnad", "driver.delhi49@uber.com", "+91-98101-00049", "DL-34-2018-049", "Hyundai Aura E", "DL-1Z-AY-1049", VehicleType.ECONOMY, 28.6075, 77.2995, 4.82, 98, 112, 30100.0));
        delhiDrivers.add(new DriverSeed("Mahesh Bhatt", "driver.delhi50@uber.com", "+91-98101-00050", "DL-35-2020-050", "Honda Amaze S", "DL-1Z-AZ-1050", VehicleType.COMFORT, 28.6410, 77.2960, 4.88, 128, 144, 43600.0));
        delhiDrivers.add(new DriverSeed("Pradeep Yadav", "driver.delhi51@uber.com", "+91-98101-00051", "DL-36-2022-051", "Maruti WagonR ZXi", "DL-1Z-BA-1051", VehicleType.ECONOMY, 28.6300, 77.2770, 4.79, 82, 96, 24500.0));
        delhiDrivers.add(new DriverSeed("Yogesh Saini", "driver.delhi52@uber.com", "+91-98101-00052", "DL-37-2019-052", "Toyota Innova Crysta", "DL-3C-BB-1052", VehicleType.XL, 28.7166, 77.1126, 4.97, 245, 270, 98000.0));
        delhiDrivers.add(new DriverSeed("Ashish Aggarwal", "driver.delhi53@uber.com", "+91-98101-00053", "DL-38-2021-053", "Honda City V", "DL-2C-BC-1053", VehicleType.PREMIER, 28.6990, 77.1380, 4.93, 168, 188, 59500.0));
        delhiDrivers.add(new DriverSeed("Balwan Singh", "driver.delhi54@uber.com", "+91-98101-00054", "DL-39-2020-054", "Swift Dzire Tour", "DL-1Z-BD-1054", VehicleType.ECONOMY, 28.5523, 77.0583, 4.84, 105, 120, 32000.0));
        delhiDrivers.add(new DriverSeed("Jaswant Rana", "driver.delhi55@uber.com", "+91-98101-00055", "DL-40-2018-055", "Toyota Glanza G", "DL-1Z-BE-1055", VehicleType.COMFORT, 28.6290, 77.0780, 4.90, 148, 168, 51000.0));

        Driver driver1 = null;
        for (int i = 0; i < delhiDrivers.size(); i++) {
            Driver d = createDriver(delhiDrivers.get(i));
            if (i == 0) driver1 = d;
        }

        // 4. SEED 55 ACTIVE DRIVERS IN LUCKNOW (UP-32)
        List<DriverSeed> lucknowDrivers = new ArrayList<>();
        lucknowDrivers.add(new DriverSeed("Mohammad Rizwan", "driver.lko1@uber.com", "+91-94520-00001", "UP-32-2019-001", "Swift Dzire VXi", "UP-32-AZ-2001", VehicleType.COMFORT, 26.8692, 80.9064, 4.95, 168, 190, 49500.0));
        lucknowDrivers.add(new DriverSeed("Akhilesh Yadav", "driver.lko2@uber.com", "+91-94520-00002", "UP-32-2020-002", "WagonR CNG Green", "UP-32-BZ-2002", VehicleType.ECONOMY, 26.8680, 80.9025, 4.88, 115, 132, 33400.0));
        lucknowDrivers.add(new DriverSeed("Vivek Mishra", "driver.lko3@uber.com", "+91-94520-00003", "UP-32-2018-003", "Toyota Innova Crysta", "UP-32-CZ-2003", VehicleType.XL, 26.8650, 80.8980, 4.98, 230, 255, 92000.0));
        lucknowDrivers.add(new DriverSeed("Ankit Tiwari", "driver.lko4@uber.com", "+91-94520-00004", "UP-32-2021-004", "Honda City ZX", "UP-32-DZ-2004", VehicleType.PREMIER, 26.8570, 80.8940, 4.94, 185, 210, 64200.0));
        lucknowDrivers.add(new DriverSeed("Salman Khan", "driver.lko5@uber.com", "+91-94520-00005", "UP-32-2019-005", "Hyundai Aura CNG", "UP-32-EZ-2005", VehicleType.ECONOMY, 26.8690, 80.9130, 4.86, 96, 112, 28900.0));
        lucknowDrivers.add(new DriverSeed("Satish Chandra", "driver.lko6@uber.com", "+91-94520-00006", "UP-32-2022-006", "Maruti Ertiga Hybrid", "UP-32-FZ-2006", VehicleType.XL, 26.8741, 80.9048, 4.91, 145, 165, 53200.0));
        lucknowDrivers.add(new DriverSeed("Alok Shukla", "driver.lko7@uber.com", "+91-94520-00007", "UP-32-2020-007", "Honda Amaze VX", "UP-32-GZ-2007", VehicleType.COMFORT, 26.8708, 80.9118, 4.90, 150, 170, 48000.0));
        lucknowDrivers.add(new DriverSeed("Rakesh Pathak", "driver.lko8@uber.com", "+91-94520-00008", "UP-32-2019-008", "Tata Tigor EV", "UP-32-HZ-2008", VehicleType.ECONOMY, 26.8715, 80.9090, 4.82, 88, 102, 26400.0));
        lucknowDrivers.add(new DriverSeed("Farhan Ali", "driver.lko9@uber.com", "+91-94520-00009", "UP-32-2021-009", "Hyundai Verna SX", "UP-32-IZ-2009", VehicleType.PREMIER, 26.8687, 80.9168, 4.96, 205, 225, 73000.0));
        lucknowDrivers.add(new DriverSeed("Imran Sheikh", "driver.lko10@uber.com", "+91-94520-00010", "UP-32-2018-010", "Swift Dzire Tour", "UP-32-JZ-2010", VehicleType.ECONOMY, 26.8670, 80.9200, 4.85, 110, 125, 31800.0));
        lucknowDrivers.add(new DriverSeed("Dharmendra Dixit", "driver.lko11@uber.com", "+91-94520-00011", "UP-32-2020-011", "Toyota Glanza", "UP-32-KZ-2011", VehicleType.COMFORT, 26.8480, 80.8900, 4.92, 160, 180, 51000.0));
        lucknowDrivers.add(new DriverSeed("Pooja Srivastava", "driver.lko12@uber.com", "+91-94520-00012", "UP-32-2022-012", "Kia Carens Luxury", "UP-32-LZ-2012", VehicleType.XL, 26.8410, 80.8970, 4.97, 215, 235, 85600.0));
        lucknowDrivers.add(new DriverSeed("Ashfaq Ahmed", "driver.lko13@uber.com", "+91-94520-00013", "UP-32-2019-013", "WagonR VXi", "UP-32-MZ-2013", VehicleType.ECONOMY, 26.8509, 80.9295, 4.80, 84, 98, 25200.0));
        lucknowDrivers.add(new DriverSeed("Virendra Pratap", "driver.lko14@uber.com", "+91-94520-00014", "UP-32-2021-014", "Hyundai Creta SX", "UP-32-NZ-2014", VehicleType.PREMIER, 26.8437, 80.9254, 4.93, 175, 195, 61500.0));
        lucknowDrivers.add(new DriverSeed("Nadeem Qureshi", "driver.lko15@uber.com", "+91-94520-00015", "UP-32-2018-015", "Maruti Baleno Delta", "UP-32-OZ-2015", VehicleType.COMFORT, 26.8475, 80.9360, 4.89, 135, 150, 44000.0));
        lucknowDrivers.add(new DriverSeed("Santosh Maurya", "driver.lko16@uber.com", "+91-94520-00016", "UP-32-2020-016", "Toyota Innova Crysta", "UP-32-PZ-2016", VehicleType.XL, 26.8467, 80.9462, 4.99, 250, 275, 99000.0));
        lucknowDrivers.add(new DriverSeed("Gyanendra Singh", "driver.lko17@uber.com", "+91-94520-00017", "UP-32-2022-017", "Swift Dzire ZXi", "UP-32-QZ-2017", VehicleType.COMFORT, 26.8490, 80.9430, 4.91, 155, 170, 49800.0));
        lucknowDrivers.add(new DriverSeed("Pankaj Bajpai", "driver.lko18@uber.com", "+91-94520-00018", "UP-32-2019-018", "Maruti Celerio Green", "UP-32-RZ-2018", VehicleType.ECONOMY, 26.8430, 80.9410, 4.83, 92, 106, 27300.0));
        lucknowDrivers.add(new DriverSeed("Jitendra Nishad", "driver.lko19@uber.com", "+91-94520-00019", "UP-32-2021-019", "Honda City VX", "UP-32-SZ-2019", VehicleType.PREMIER, 26.8310, 80.9220, 4.95, 190, 210, 67800.0));
        lucknowDrivers.add(new DriverSeed("Arjun Bind", "driver.lko20@uber.com", "+91-94520-00020", "UP-32-2018-020", "Maruti Ertiga ZXi", "UP-32-TZ-2020", VehicleType.XL, 26.8330, 80.9200, 4.90, 140, 158, 51000.0));
        lucknowDrivers.add(new DriverSeed("Brijesh Tripathi", "driver.lko21@uber.com", "+91-94520-00021", "UP-32-2020-021", "Honda Amaze S", "UP-32-UZ-2021", VehicleType.COMFORT, 26.8420, 80.9600, 4.88, 125, 140, 42500.0));
        lucknowDrivers.add(new DriverSeed("Danish Ansari", "driver.lko22@uber.com", "+91-94520-00022", "UP-32-2022-022", "Hyundai Aura E", "UP-32-VZ-2022", VehicleType.ECONOMY, 26.8570, 80.9590, 4.81, 78, 92, 23800.0));
        lucknowDrivers.add(new DriverSeed("Kailash Nath", "driver.lko23@uber.com", "+91-94520-00023", "UP-32-2019-023", "Skoda Slavia Style", "UP-32-WZ-2023", VehicleType.PREMIER, 26.8636, 80.9388, 4.97, 220, 240, 78000.0));
        lucknowDrivers.add(new DriverSeed("Kamran Hasan", "driver.lko24@uber.com", "+91-94520-00024", "UP-32-2021-024", "Toyota Innova Crysta", "UP-32-XZ-2024", VehicleType.XL, 26.8680, 80.9410, 4.96, 235, 255, 93500.0));
        lucknowDrivers.add(new DriverSeed("Mahesh Awasthi", "driver.lko25@uber.com", "+91-94520-00025", "UP-32-2018-025", "Swift Dzire VXi", "UP-32-YZ-2025", VehicleType.COMFORT, 26.8770, 80.9520, 4.91, 152, 172, 48900.0));
        lucknowDrivers.add(new DriverSeed("Neeraj Pandey", "driver.lko26@uber.com", "+91-94520-00026", "UP-32-2020-026", "WagonR CNG", "UP-32-ZZ-2026", VehicleType.ECONOMY, 26.8870, 80.9420, 4.84, 105, 120, 31200.0));
        lucknowDrivers.add(new DriverSeed("Om Prakash Pal", "driver.lko27@uber.com", "+91-94520-00027", "UP-32-2022-027", "Kia Seltos HTK", "UP-32-AA-2027", VehicleType.PREMIER, 26.8810, 80.9360, 4.94, 180, 200, 65000.0));
        lucknowDrivers.add(new DriverSeed("Prabhat Kesarwani", "driver.lko28@uber.com", "+91-94520-00028", "UP-32-2019-028", "Maruti Ertiga VXi", "UP-32-AB-2028", VehicleType.XL, 26.8950, 80.9600, 4.92, 165, 185, 58000.0));
        lucknowDrivers.add(new DriverSeed("Qasim Jafri", "driver.lko29@uber.com", "+91-94520-00029", "UP-32-2021-029", "Toyota Glanza V", "UP-32-AC-2029", VehicleType.COMFORT, 26.8750, 80.9850, 4.90, 142, 160, 46500.0));
        lucknowDrivers.add(new DriverSeed("Ravi Prakash", "driver.lko30@uber.com", "+91-94520-00030", "UP-32-2018-030", "Tata Punch EV", "UP-32-AD-2030", VehicleType.ECONOMY, 26.8833, 80.9833, 4.83, 90, 104, 27000.0));
        lucknowDrivers.add(new DriverSeed("Shailendra Gaur", "driver.lko31@uber.com", "+91-94520-00031", "UP-32-2020-031", "Toyota Innova Hycross", "UP-32-AE-2031", VehicleType.XL, 26.8900, 80.9870, 4.98, 240, 260, 97000.0));
        lucknowDrivers.add(new DriverSeed("Tariq Mahmood", "driver.lko32@uber.com", "+91-94520-00032", "UP-32-2022-032", "Honda City ZX", "UP-32-AF-2032", VehicleType.PREMIER, 26.8504, 80.9984, 4.96, 210, 230, 74000.0));
        lucknowDrivers.add(new DriverSeed("Umesh Chandra", "driver.lko33@uber.com", "+91-94520-00033", "UP-32-2019-033", "Swift Dzire ZXi", "UP-32-AG-2033", VehicleType.COMFORT, 26.8550, 80.9930, 4.89, 138, 155, 45200.0));
        lucknowDrivers.add(new DriverSeed("Vinay Bhargava", "driver.lko34@uber.com", "+91-94520-00034", "UP-32-2021-034", "WagonR ZXi", "UP-32-AH-2034", VehicleType.ECONOMY, 26.8580, 80.9850, 4.82, 85, 98, 25600.0));
        lucknowDrivers.add(new DriverSeed("Wasim Akram", "driver.lko35@uber.com", "+91-94520-00035", "UP-32-2018-035", "Kia Carens Prestige", "UP-32-AI-2035", VehicleType.XL, 26.8640, 80.9950, 4.93, 175, 195, 62000.0));
        lucknowDrivers.add(new DriverSeed("Yogendra Mohan", "driver.lko36@uber.com", "+91-94520-00036", "UP-32-2020-036", "Hyundai Verna SX(O)", "UP-32-AJ-2036", VehicleType.PREMIER, 26.8520, 80.9750, 4.95, 195, 215, 69500.0));
        lucknowDrivers.add(new DriverSeed("Zakir Hussain", "driver.lko37@uber.com", "+91-94520-00037", "UP-32-2022-037", "Honda Amaze VX", "UP-32-AK-2037", VehicleType.COMFORT, 26.8523, 80.9733, 4.88, 130, 145, 43100.0));
        lucknowDrivers.add(new DriverSeed("Abhishek Dubey", "driver.lko38@uber.com", "+91-94520-00038", "UP-32-2019-038", "Maruti Celerio ZXi", "UP-32-AL-2038", VehicleType.ECONOMY, 26.8383, 80.9856, 4.85, 100, 115, 30200.0));
        lucknowDrivers.add(new DriverSeed("Balram Yadav", "driver.lko39@uber.com", "+91-94520-00039", "UP-32-2021-039", "Toyota Innova Crysta", "UP-32-AM-2039", VehicleType.XL, 26.8320, 80.9890, 4.97, 230, 250, 91500.0));
        lucknowDrivers.add(new DriverSeed("Chandra Bhan", "driver.lko40@uber.com", "+91-94520-00040", "UP-32-2018-040", "Hyundai Creta SX", "UP-32-AN-2040", VehicleType.PREMIER, 26.8617, 80.9975, 4.94, 185, 205, 66000.0));
        lucknowDrivers.add(new DriverSeed("Deepak Rastogi", "driver.lko41@uber.com", "+91-94520-00041", "UP-32-2020-041", "Maruti Baleno Alpha", "UP-32-AO-2041", VehicleType.COMFORT, 26.8530, 80.9740, 4.90, 148, 168, 48200.0));
        lucknowDrivers.add(new DriverSeed("Ehsaan Khan", "driver.lko42@uber.com", "+91-94520-00042", "UP-32-2022-042", "Tata Tiago EV", "UP-32-AP-2042", VehicleType.ECONOMY, 26.8643, 80.9991, 4.81, 79, 94, 24100.0));
        lucknowDrivers.add(new DriverSeed("Girish Chandra", "driver.lko43@uber.com", "+91-94520-00043", "UP-32-2019-043", "Toyota Fortuner", "UP-32-AQ-2043", VehicleType.XL, 26.8250, 81.0200, 4.99, 260, 285, 115000.0));
        lucknowDrivers.add(new DriverSeed("Harishankar Tiwari", "driver.lko44@uber.com", "+91-94520-00044", "UP-32-2021-044", "Volkswagen Virtus Topline", "UP-32-AR-2044", VehicleType.PREMIER, 26.8123, 81.0116, 4.95, 190, 210, 68900.0));
        lucknowDrivers.add(new DriverSeed("Irshad Siddiqui", "driver.lko45@uber.com", "+91-94520-00045", "UP-32-2018-045", "Swift Dzire Tour", "UP-32-AS-2045", VehicleType.ECONOMY, 26.8115, 81.0162, 4.84, 102, 118, 31000.0));
        lucknowDrivers.add(new DriverSeed("Jagdish Prasad", "driver.lko46@uber.com", "+91-94520-00046", "UP-32-2020-046", "Honda Amaze VX", "UP-32-AT-2046", VehicleType.COMFORT, 26.7725, 80.9880, 4.92, 162, 182, 52400.0));
        lucknowDrivers.add(new DriverSeed("Kamlesh Yadav", "driver.lko47@uber.com", "+91-94520-00047", "UP-32-2022-047", "Maruti Ertiga ZXi+", "UP-32-AU-2047", VehicleType.XL, 26.7790, 80.9930, 4.96, 220, 240, 88000.0));
        lucknowDrivers.add(new DriverSeed("Laxman Rawat", "driver.lko48@uber.com", "+91-94520-00048", "UP-32-2019-048", "Hyundai Aura SX", "UP-32-AV-2048", VehicleType.COMFORT, 26.7458, 80.9389, 4.89, 134, 150, 43900.0));
        lucknowDrivers.add(new DriverSeed("Manish Kashyap", "driver.lko49@uber.com", "+91-94520-00049", "UP-32-2021-049", "WagonR CNG", "UP-32-AW-2049", VehicleType.ECONOMY, 26.7910, 80.9410, 4.82, 87, 101, 26200.0));
        lucknowDrivers.add(new DriverSeed("Nand Lal", "driver.lko50@uber.com", "+91-94520-00050", "UP-32-2018-050", "Toyota Innova Crysta", "UP-32-AX-2050", VehicleType.XL, 26.7900, 80.9100, 4.97, 245, 270, 97500.0));
        lucknowDrivers.add(new DriverSeed("Ompal Saini", "driver.lko51@uber.com", "+91-94520-00051", "UP-32-2020-051", "Honda City ZX", "UP-32-AY-2051", VehicleType.PREMIER, 26.8138, 80.9009, 4.94, 182, 202, 65800.0));
        lucknowDrivers.add(new DriverSeed("Pradeep Sonkar", "driver.lko52@uber.com", "+91-94520-00052", "UP-32-2022-052", "Swift Dzire VXi", "UP-32-AZ-2052", VehicleType.COMFORT, 26.7932, 80.8998, 4.91, 150, 168, 48500.0));
        lucknowDrivers.add(new DriverSeed("Rameshwar Chaurasia", "driver.lko53@uber.com", "+91-94520-00053", "UP-32-2019-053", "WagonR LXi", "UP-32-BA-2053", VehicleType.ECONOMY, 26.8050, 80.9040, 4.80, 82, 96, 24800.0));
        lucknowDrivers.add(new DriverSeed("Subhash Lodhi", "driver.lko54@uber.com", "+91-94520-00054", "UP-32-2021-054", "Kia Carens Luxury Plus", "UP-32-BB-2054", VehicleType.XL, 26.7750, 80.8870, 4.95, 210, 230, 84000.0));
        lucknowDrivers.add(new DriverSeed("Tulsiram Gautam", "driver.lko55@uber.com", "+91-94520-00055", "UP-32-2018-055", "Toyota Camry Hybrid", "UP-32-BC-2055", VehicleType.PREMIER, 26.7606, 80.8836, 4.98, 255, 280, 102000.0));

        for (DriverSeed seed : lucknowDrivers) {
            createDriver(seed);
        }

        // 5. Promo Codes
        promoCodeRepository.save(new PromoCode("FIRST50", 50.0, 15.0, 20.0, LocalDateTime.now().plusMonths(6)));
        promoCodeRepository.save(new PromoCode("UBER20", 20.0, 10.0, 15.0, LocalDateTime.now().plusMonths(3)));
        promoCodeRepository.save(new PromoCode("SUMMER25", 25.0, 12.0, 18.0, LocalDateTime.now().plusMonths(4)));

        // 6. Seed Past Completed Ride for demonstration history
        if (driver1 != null) {
            Ride pastRide = new Ride();
            pastRide.setRider(rider);
            pastRide.setDriver(driver1);
            pastRide.setPickupAddress("Connaught Place Inner Circle, New Delhi");
            pastRide.setPickupLatitude(28.6315);
            pastRide.setPickupLongitude(77.2167);
            pastRide.setDropAddress("Indira Gandhi International Airport, Terminal 3");
            pastRide.setDropLatitude(28.5562);
            pastRide.setDropLongitude(77.1000);
            pastRide.setDistanceKm(14.8);
            pastRide.setDurationMinutes(35);
            pastRide.setBaseFare(140.0);
            pastRide.setDistanceFare(222.0);
            pastRide.setTimeFare(52.5);
            pastRide.setSurgeMultiplier(1.0);
            pastRide.setDiscount(0.0);
            pastRide.setTotalFare(414.50);
            pastRide.setOtp("7294");
            pastRide.setStatus(RideStatus.COMPLETED);
            pastRide.setVehicleType(VehicleType.COMFORT);
            pastRide.setCreatedAt(LocalDateTime.now().minusDays(1));
            pastRide.setAcceptedAt(LocalDateTime.now().minusDays(1).plusMinutes(2));
            pastRide.setArrivedAt(LocalDateTime.now().minusDays(1).plusMinutes(8));
            pastRide.setStartedAt(LocalDateTime.now().minusDays(1).plusMinutes(10));
            pastRide.setCompletedAt(LocalDateTime.now().minusDays(1).plusMinutes(45));

            Ride savedPastRide = rideRepository.save(pastRide);

            // Payment for past ride
            Payment pastPayment = new Payment(
                    savedPastRide,
                    "pi_3N9xKp2eZvKYlo2C0MockDemo",
                    414.50,
                    "INR",
                    PaymentMethod.STRIPE_CARD
            );
            pastPayment.setStatus(PaymentStatus.COMPLETED);
            pastPayment.setTransactionDate(LocalDateTime.now().minusDays(1).plusMinutes(46));
            pastPayment.setReceiptUrl("/api/rides/" + savedPastRide.getId() + "/invoice");
            paymentRepository.save(pastPayment);

            // Rating for past ride
            Rating pastRating = new Rating(
                    savedPastRide,
                    rider,
                    driver1,
                    5,
                    "Excellent smooth drive, clean car, and very professional driver!",
                    "Clean Car, Polite, Great Driving"
            );
            ratingRepository.save(pastRating);

            // Sample Support Ticket
            SupportTicket sampleTicket = new SupportTicket(
                    rider,
                    savedPastRide,
                    "Left water bottle in backseat",
                    "Hi, I think I forgot my steel thermos bottle in John's Camry after yesterday's airport trip.",
                    false
            );
            sampleTicket.setStatus(TicketStatus.OPEN);
            supportTicketRepository.save(sampleTicket);
        }

        logger.info("Demo database seeded successfully with 55 Delhi drivers, 55 Lucknow drivers (110 total), Admin, Rider, Promo Codes, and Ride History.");
    }
}
