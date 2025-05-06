import pyodbc
import bcrypt
##the following is connecting to the database
conn_str = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=database.database.windows.net;DATABASE=LifeLog_DB;UID=username;PWD=password;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"

conn = pyodbc.connect(conn_str)

cursor = conn.cursor()

print("Connected to database")

######the following is actually executing commands with a focus on inserting a hashed password into the database

base_password = 'af123JohnHenry@4'
##hashed_password = bcrypt.hashpw(base_password.encode(), bcrypt.gensalt())
##print(hashed_password)

##uid = 'test101'
##email = 'test101@example.com'
##sync = 1

##query = "INSERT INTO account_info (user_id, email, hashed_pass, sync, passkey) VALUES (?, ?, ?, ?, ?)"

##cursor.execute(query, (uid, email, hashed_password, sync, base_password))
##conn.commit()

##print("Row Inserted")


cursor.execute("SELECT hashed_pass FROM account_info WHERE user_id = ?", ('test101',))
for row in cursor.fetchall():
    print("hashed pass:", row[0])
    hashpass = row[0]

if bcrypt.checkpw(base_password.encode(), hashpass):
    print("password matches")
else:
    print("password incorrect")


#closing connection
cursor.close()
conn.close()


