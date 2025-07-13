#news
cd news
python3 generate_news.py
cd ..

#approval ratings
cd approval_ratings
curl https://static.dwcdn.net/data/vknzT.csv?v=0 > polls.csv
python3 approval_polling.py
cd ..

#sports elos
cd sports_elos
python3 populate_data.py
cd ..

#cd ../../web-app
#npm run build
#npm run deploy
